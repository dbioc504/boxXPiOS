import { useCallback, useEffect, useState } from "react";
import type { Style } from '@/types/common';
import { useRepos } from "@/lib/providers/RepoProvider";
import { loadStyle, saveStyle } from "@/lib/storage/userPrefs";

export function useUserStyle(userId: string) {
    const { skills } = useRepos();
    const [style, setStyleState] = useState<Style | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const fromRepo = await skills.getUserStyle(userId);
                if (mounted && fromRepo) {
                    setStyleState(fromRepo);
                    setLoading(false);
                    return
                }

                const cached = await loadStyle(userId);
                if (mounted) {
                    setStyleState(cached);
                    setLoading(false);
                }
            } catch {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [userId, skills]);

    const setStyle = useCallback(
        async (next: Style) => {
            setStyleState(next);
            await Promise.allSettled([
                skills.setUserStyle(userId, next),
                saveStyle(userId, next)
            ]);
        },
        [skills, userId]
    );

    return { style, setStyle, loading };

}