import React, { createContext, useContext, useMemo } from 'react';
import type { SkillsRepo } from '@/lib/repos/skills.repo';
import { makeMockSkillsRepo } from "@/lib/repos/skills.repo.mock";
import { supabaseSkillsRepo } from "@/lib/repos/skills.repo.supabase";

type RepoCtxValue = { skills: SkillsRepo };

const RepoCtx = createContext<RepoCtxValue | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
    const useSupabase =
        (process.env.EXPO_PUBLIC_USE_SUPABASE ?? 'false').toLowerCase() === 'true';

    const skills = useMemo<SkillsRepo>(() => {
        return useSupabase ? supabaseSkillsRepo : makeMockSkillsRepo();
    }, [useSupabase]);

    const value = useMemo(() => ({ skills }), [skills]);

    return <RepoCtx.Provider value={value}>{children}</RepoCtx.Provider>
}

export function useRepos() {
    const ctx = useContext(RepoCtx);
    if (!ctx) throw new Error('useRepos must be used inside RepoProvider');
    return ctx;
}