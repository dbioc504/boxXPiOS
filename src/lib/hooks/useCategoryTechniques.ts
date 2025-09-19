import { useEffect, useState, useCallback } from 'react';
import { useRepos } from "@/lib/providers/RepoProvider";
import type { Category } from '@/types/common';
import type { Technique } from '@/types/technique';

export function useCategoryTechniques(userId: string, category: Category) {
    const repo = useRepos();
    const [items, setItems] = useState<Technique[]>([]);
    const [loading, setLoad] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoad(true); setError(null);
        try { setItems(await repo.skills.listUserTechniques(userId, category)); }
        catch (e: any) { setError(e?.message ?? 'Failed to load'); }
        finally { setLoad(false); }
    }, [repo, userId, category]);

    useEffect(() => { refresh(); }, [refresh]);

    const add = useCallback(async (title: string) => {
        setSaving(true);
        try {
            const created = await repo.skills.createUserTechnique(userId, category, title);
            setItems(prev => [created, ...prev]);
        } finally { setSaving(false); }
    }, [repo.skills, userId, category]);

    const edit = useCallback(async (id: string, title: string) => {
        setSaving(true);
        try {
            await repo.skills.updateUserTechnique(userId, id, { title });
            setItems(prev => prev.map(t => t.id === id ? { ...t, title } : t));
        } finally { setSaving(false); }
    }, [repo, userId]);

    const remove = useCallback(async (id: string) => {
        setSaving(true);
        try {
            await repo.skills.deleteUserTechnique(userId, id);
            setItems(prev => prev.filter(t => t.id !== id));
        } finally { setSaving(false); }
    }, [repo, userId]);

    return { items, loading, saving, error, add, edit, remove, refresh };
}
