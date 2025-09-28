import {useRepos} from "@/lib/providers/RepoProvider";
import {useCallback, useEffect, useState} from "react";
import {Movement} from "@/types/common";
import {useAuth} from "@/lib/AuthProvider";

export function useComboBuilder(comboId: string) {
    const { combos } = useRepos();
    const { user } = useAuth();
    const [steps, setSteps] = useState<Movement[]>([]);
    const [drag, setDrag] = useState({ active: false, ghost: null as Movement | null, x: 0, y: 0, insertIndex:-1 });

    const refresh = useCallback(async () => {
        const rows = await combos.listSteps(user.id, comboId);
        setSteps(rows.sort((a,b) => a.position - b.position).map(r=>r.movement));
    }, [comboId]);

    useEffect(() => { refresh(); }, [refresh]);

    const insertAt = useCallback(async (movement: Movement, index: number) => {
        const pos = index ?? steps.length;
        setSteps(prev => {
            const next = [...prev]; next.splice(pos,0,movement); return next;
        });

        const final = (idx => idx < 0 ? steps.length : idx)(pos);
        await combos.insertStep(user.id, comboId, movement, final);
    }, [comboId, steps.length]);

    const moveTo = useCallback(async (from: number, to: number) => {
        if (from === to) return;
        setSteps(prev => {
            const next = [...prev];
            const [m] = next.splice(from,1);
            next.splice(to,0,m);
            return next;
        });
    //     TODO: persist range of new positions via combos.moveStep
    }, []);

    return { steps, refresh, insertAt, moveTo, drag, setDrag };
}