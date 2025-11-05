import React, {createContext, useContext, useMemo} from 'react';
import type {SkillsRepo} from '@/lib/repos/skills.repo';
import {makeMockSkillsRepo} from "@/lib/repos/skills.repo.mock";
import {supabaseSkillsRepo} from "@/lib/repos/skills.repo.supabase";
import {CombosRepo} from "@/lib/repos/combos.repo";
import {useAuth} from "@/lib/AuthProvider";
import {supabaseCombosRepo} from "@/lib/repos/combos.repo.supabase";
import {mockCombosRepo} from "@/lib/repos/combos.repo.mock";

type RepoCtxValue = {
    skills: SkillsRepo;
    combos: CombosRepo;
};

const RepoCtx = createContext<RepoCtxValue | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
    const useSupabase =
        (process.env.EXPO_PUBLIC_USE_SUPABASE ?? 'false').toLowerCase() === 'true';

    const { user } = useAuth();

    const skills = useMemo<SkillsRepo>(() => {
        return useSupabase ? supabaseSkillsRepo : makeMockSkillsRepo();
    }, [useSupabase]);

    const combos = useMemo<CombosRepo>(() => {
        return useSupabase
            ? supabaseCombosRepo
            : mockCombosRepo;
    }, [useSupabase]);

    const value = useMemo(() => ({ skills, combos }), [skills, combos]);

    return <RepoCtx.Provider value={value}>{children}</RepoCtx.Provider>
}

export function useRepos() {
    const ctx = useContext(RepoCtx);
    if (!ctx) throw new Error('useRepos must be used inside RepoProvider');
    return ctx;
}