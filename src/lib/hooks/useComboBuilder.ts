// src/hooks/useComboBuilder.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { Movement } from "@/types/common";
import { ComboLL, llFromArray, llToArray, llInsertAt, llMove, llRemoveAt } from "@/types/comboLL";
import { CombosRepo, ComboId } from "@/lib/repos/combos.repo";
import { mockCombosRepo } from "@/lib/repos/combos.repo.mock";

type Options = {
    userId?: string;
    comboId?: ComboId;
    repo?: CombosRepo;
};

export function useComboBuilder(opts: Options = {}) {
    const { user } = useAuth();
    const userId = user?.id ?? "demo";
    const repo = opts.repo ?? mockCombosRepo;

    const [comboId, setComboId] = useState<ComboId | null>(opts.comboId ?? null);
    const [ll, setLL] = useState<ComboLL>(() => llFromArray([]));
    const steps = useMemo(() => llToArray(ll).moves, [ll]);

    // load if comboId provided
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!comboId) return;
            const res = await repo.getCombo(userId, comboId);
            if (mounted && res) {
                setLL(llFromArray(res.steps));
            }
        })();
        return () => { mounted = false; };
    }, [comboId, repo, userId]);

    const setFromArray = useCallback((arr: Movement[]) => setLL(llFromArray(arr)), []);

    const append = useCallback((m: Movement) => {
        setLL(prev => llInsertAt(prev, m, llToArray(prev).moves.length));
    }, []);

    const insertAt = useCallback((m: Movement, index: number) => {
        setLL(prev => llInsertAt(prev, m, index));
    }, []);

    const move = useCallback((from: number, to: number) => {
        setLL(prev => llMove(prev, from, to));
    }, []);

    const removeAt = useCallback((index: number) => {
        setLL(prev => llRemoveAt(prev, index));
    }, []);

    const replaceAll = useCallback((arr: Movement[]) => setFromArray(arr), [setFromArray]);

    const save = useCallback(async () => {
        if (!comboId) {
            // create a new combo on first save
            const meta = await repo.createCombo(userId, { name: "New Combo" }, steps);
            setComboId(meta.id);
            return;
        }
        await repo.saveSteps(userId, comboId, steps);
    }, [comboId, repo, steps, userId]);

    return {
        comboId, setComboId,
        steps,
        append, insertAt, move, removeAt, replaceAll,
        save,
    };
}
