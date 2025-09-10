import {useEffect, useState, useCallback} from "react";
import type { TechniqueRow } from '@/lib/repos/skills.repo'
import { useRepos } from '@/lib/providers/RepoProvider'

export function useCategory(userId: string, cat: string) {
    const { skills } = useRepos();
    const [all, setAll] = useState<TechniqueRow[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [catalog, selected] = await Promise.all([
                    skills.listTechniquesByCategory(cat),
                    skills.getUserTechniques(userId, cat),
                ]);
                if (!mounted) return;
                setAll(catalog);
                setSelectedIds(selected);
            } catch {
                if (mounted) setError('Failed to load category');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [skills, userId, cat]);

    const setSelected = useCallback(async (ids: string[]) => {
        try {
            setSaving(true);
            setSelected(ids);
            await skills.setUserTechniques(userId, cat, ids);
        } catch {
            setError('Failed to save techniques');
        } finally {
            setSaving(false);
        }
    }, [skills, userId, cat]);

    return { all, selectedIds, setSelected, loading, saving, error };
}