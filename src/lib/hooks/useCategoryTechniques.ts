import { useEffect, useState, useCallback } from 'react';
import { useRepos } from "@/lib/providers/RepoProvider";
import type { Category } from '@/types/common';
import type { Technique } from '@/types/technique';

export function useCategoryTechniques(userId: string, category: Category) {
    const repo = useRepos();
    const skills = (repo as any).skills ?? repo;

    const [items, setItems] = useState<Technique[]>([]);
    const [loading, setLoad] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoad(true); setError(null);
        try {
            const list: Technique[] = await skills.listUserTechniques(userId, category);
            setItems(list);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load');
        } finally {
            setLoad(false);
        }
    }, [skills, userId, category]);

    useEffect(() => { refresh(); }, [refresh]);

    const add = useCallback(async (title: string) => {
        setSaving(true);
        try {
            const created = await repo.skills.createUserTechnique(userId, category, title);
            setItems(prev => [created, ...prev]);
            return created;
        } finally { setSaving(false); }
    }, [skills, userId, category]);

    const edit = useCallback(async (id: string, title: string) => {
        setSaving(true);
        try {
            await skills.updateUserTechnique(userId, id, { title });
            setItems(prev => prev.map(t => t.id === id ? { ...t, title } : t));
        } finally { setSaving(false); }
    }, [skills, userId]);

    const remove = useCallback(async (id: string) => {
        setSaving(true);
        try {
            await skills.deleteUserTechnique(userId, id);
            setItems(prev => prev.filter(t => t.id !== id));
        } finally { setSaving(false); }
    }, [skills, userId]);

    return { items, loading, saving, error, add, edit, remove, refresh };
}
