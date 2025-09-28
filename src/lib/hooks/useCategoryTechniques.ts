// example: src/hooks/useCategoryTechniques.ts
import { useEffect, useState, useCallback } from "react";
import { useRepos } from "@/lib/providers/RepoProvider";
import { useAuth } from "@/lib/AuthProvider";
import type { Category } from "@/types/common";
import type { Technique } from "@/types/technique";

export function useCategoryTechniques(category: Category) {
    const { skills } = useRepos();
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [items, setItems] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!userId) return;
        const rows = await skills.listUserTechniques(userId, category);
        setItems(rows);
    }, [skills, userId, category]);

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    const add = useCallback(
        async (title: string) => {
            if (!userId) return;
            const created = await skills.createUserTechnique(userId, category, title);
            setItems(prev => [created, ...prev]);
        },
        [skills, userId, category]
    );

    const edit = useCallback(
        async (id: string, title: string) => {
            if (!userId) return;
            const updated = await skills.updateUserTechnique(userId, id, { title });
            setItems(prev => prev.map(t => (t.id === id ? updated : t)));
        },
        [skills, userId]
    );

    const remove = useCallback(
        async (id: string) => {
            if (!userId) return;
            await skills.deleteUserTechnique(userId, id);
            setItems(prev => prev.filter(t => t.id !== id));
        },
        [skills, userId]
    );

    return { items, loading, refresh, add, edit, remove };
}
