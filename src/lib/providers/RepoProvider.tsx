import React, { createContext, useContext, useMemo } from "react";
import type { SkillsRepo } from "@/lib/repos/skills.repo";
import  { makeMockSkillsRepo } from "@/lib/repos/skills.repo.mock";

const RepoCtx = createContext<{ skills: SkillsRepo } | null>(null);

export const RepoProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
    const skills = useMemo(() => makeMockSkillsRepo(), []);
    return <RepoCtx.Provider value={{ skills }}>{children}</RepoCtx.Provider>
}

export function useRepos() {
    const ctx = useContext(RepoCtx);
    if (!ctx) throw new Error('useRepos must be used inside RepoProvider');
    return ctx;
}