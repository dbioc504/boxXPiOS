import { useEffect, useState, useCallback } from "react";
import type { Style } from '@/lib/repos/skills.repo';
import { useRepos } from '@/lib/providers/RepoProvider';

export function useUserStyle(userId: string) {
    const { skills } = useRepos();
    const [style, setStyle] = useState<Style | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const s = await skills.getUserStyle(userId);
                if (mounted) setStyle(s);
            } catch (e) {
                if (mounted) setError('Failed to load style');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [skills, userId]);

    const updateStyle = useCallback(async (next: Style) => {
        try {
            setSaving(true);
            setStyle(next);
            await skills.setUserStyle(userId, next);
        } catch {
            setError('Failed to save style');
        } finally {
            setSaving(false);
        }
    }, [skills, userId]);

    return { style, setStyle: updateStyle, loading, saving, error};
}