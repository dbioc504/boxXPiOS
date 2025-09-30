import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movement } from '@/types/common'
import type { CombosRepo, StepDto } from "@/lib/repos/combos.repo";

type Opts = {
    userId: string;
    comboId: string;
    repo: CombosRepo;
};

export function useComboBuilder({ userId, comboId, repo }: Opts) {
    const [rows, setRows] = useState<StepDto[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const list = await repo.listSteps(userId, comboId);
        setRows(list.sort((a,b)=>a.position-b.position));
    }, [repo, userId, comboId]);

    useEffect(() => { setLoading(true); refresh().finally(() => setLoading(false)); }, [refresh]);

    const steps: Movement[] = useMemo(() => rows.map(r=>r.movement), [rows]);

    const insertAt = useCallback(async (movement: Movement, at: number) => {
        setRows(prev => {
            const next = prev.slice();
            const newRow: StepDto = {
                id: `temp-${Date.now()}`,
                comboId,
                position: Math.max(0, Math.min(at, prev.length)),
                movement
            };
            next.splice(newRow.position, 0, newRow);
            return next.map((r,i) => ({...r, position: i}));
        });
        await repo.insertStep(userId, comboId, movement, at);
        await refresh();
    }, [repo, userId, comboId, refresh]);

    const moveTo = useCallback(async (from: number, to: number) => {
        if (from === to) return;
        const current = rows[from];
        if (!current) return;
        setRows(prev => {
            const next = prev.slice();
            const [m] = next.splice(from, 1);
            next.splice(to, 0, m);
            return next.map((r, i) => ({...r,position: i}));
        });
        await repo.moveStep(userId, comboId, current.id, to);
        await refresh();
    }, [repo, userId, comboId, rows, refresh]);

    const removeAt = useCallback(async (index: number) => {
        const current = rows[index];
        if (!current) return;
        setRows(prev => prev.filter((_, i) => i !== index).map((r,i) => ({...r, position: i})));
        await repo.deleteStep(userId, comboId, current.id);
        await refresh();
    }, [repo, userId, comboId, rows, refresh]);

    return { steps, loading, refresh, insertAt, moveTo, removeAt };
}