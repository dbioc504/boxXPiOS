import { useEffect, useMemo, useState } from "react";
import { useRepos } from '@/lib/providers/RepoProvider'
import type { Category, Id } from "@/types/common";
import type { TechniqueRow } from "@/types/validation";

type State = {
    all: TechniqueRow[];
    selectedIds: Id[];
    loading: boolean;
    saving: boolean;
    error: string;
};

export function useCategory(userId: string, category: Category) {
    const { skills } = useRepos();
    const [state, setState] = useState<State>({
       all: [],
       selectedIds: [],
       loading: true,
       saving: false,
       error: '',
    });

    useEffect(() => {
        let cancelled = false;
        setState(s => ({ ...s, loading: true, error: '' }))

        Promise.all([
            skills.listTechniquesByCategory(category),
            skills.getUserTechniques(userId, category),
        ])
            .then(([all, selectedIds]) => {
                if (cancelled) return;
                setState(s => ({ ...s, all, selectedIds, loading: false }));
            })
            .catch(err => {
                if (cancelled) return;
                setState(s => ({ ...s, loading: false, error: err?.message ?? 'Failed to load' }));
            });

            return () => { cancelled = true };
    }, [skills, userId, category]);

    async function setSelected(nextIds: Id[]) {
        const next = Array.from(new Set(nextIds));
        const prev = state.selectedIds;

        setState(s => ({ ...s, selectedIds: next, saving: true, error: '' }));

        try {
            await skills.setUserTechniques(userId, category, next);
            setState(s => ({  ...s, saving: false }));
        } catch (e: any) {
            setState(s => ({
                ...s,
                selectedIds: prev,
                saving: false,
                error: e?.message ?? 'Failed to save selection',
            }));
        }
    }

    function toggleSelection(id: Id) {
        const has = state.selectedIds.includes(id);
        const next = has
            ? state.selectedIds.filter(x => x !== id)
            : [...state.selectedIds, id];
        void setSelected(next);
    }

    return useMemo(() => ({
        all: state.all,
        selectedIds: state.selectedIds,
        loading: state.loading,
        saving: state.saving,
        error: state.error,
        setSelected,
        toggleSelection,
    }), [state]);
}