import React, {createContext, use, useCallback, useContext, useEffect, useMemo, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Style } from '@/types/common'
import { useAuth } from '@/lib/AuthProvider'
import { useRepos } from "@/lib/providers/RepoProvider";

type Ctx = {
    ready: boolean;
    style: Style | null;
    save: (next: Style) => Promise<void>;
    refresh: () => Promise<void>;
    clear: () => Promise<void>;
}

const StyleCtx = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'bxp:user_style';

export function StyleProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { skills } = useRepos();
    const [ ready, setReady ] = useState(false);
    const [ style, setStyle] = useState<Style | null>(null);

    const storageKey = useMemo(
        () => (user ? `${STORAGE_KEY_PREFIX}:${user.id}` : null),
        [user]
    );

    const refresh = useCallback(async () => {
        if (!user) return;
        const s = await skills.getUserStyle(user.id);
        setStyle(s ?? null);
        if (storageKey) {
            if (s) await AsyncStorage.setItem(storageKey, s);
            else await AsyncStorage.removeItem(storageKey);
        }
    }, [skills, user, storageKey]);

    const save = useCallback(
        async (next: Style) => {
            if (!user) return;
            await skills.setUserStyle(user.id, next);
            setStyle(next);
            if (storageKey) await AsyncStorage.setItem(storageKey, next);
        },
        [skills, user, storageKey]
    );

    const clear = useCallback(async () => {
        setStyle(null);
        if (storageKey) await AsyncStorage.removeItem(storageKey);
    }, [storageKey]);

    useEffect(() => {
        let cancelled = false;

        async function hydrate() {
            setReady(false);

            if (!user) {
                setStyle(null);
                setReady(true);
                return;
            }

            if (storageKey) {
                const cached = await AsyncStorage.getItem(storageKey);
                if (!cancelled && cached) setStyle(cached as Style);
            }

            await refresh();

            if (!cancelled) setReady(true);
        }

        hydrate();
        return () => {
            cancelled = true;
        };
    }, [user, storageKey, refresh]);

    const value = useMemo(
        () => ({ ready, style, save, refresh, clear }),
        [ready, style, save, refresh, clear]
    );

    return <StyleCtx.Provider value={value}>{children}</StyleCtx.Provider>
}

export function useStyle() {
    const ctx = useContext(StyleCtx);
    if (!ctx) throw new Error('useStyle must be used inside StyleProvider');
    return ctx;
}