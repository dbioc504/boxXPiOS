import React, { createContext, useContext, useMemo } from "react";
import type { SkillsRepo } from "@/lib/repos/skills.repo";
import  { makeMockSkillsRepo } from "@/lib/repos/skills.repo.mock";

type ReposShape = {
    skills: ReturnType<typeof makeMockSkillsRepo>;
};

const RepoCtx = createContext<{ skills: SkillsRepo } | null>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
    const value = useMemo<ReposShape>(() => {
        return { skills: makeMockSkillsRepo() }
    }, [])

    return <RepoCtx.Provider value={value}>{children}</RepoCtx.Provider>;
}

export function useRepos() {
    const ctx = useContext(RepoCtx);
    if (!ctx) throw new Error('useRepos must be used inside RepoProvider');
    return ctx;
}