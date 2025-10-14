import React, { createContext, useContext } from 'react';
import type { CombosRepo } from './combos.repo';
import { combosRepo } from './index';

const CombosRepoCtx = createContext<CombosRepo | null>(null);

export function CombosRepoProvider({ children }: { children: React.ReactNode }) {
    return <CombosRepoCtx.Provider value={combosRepo}>{children}</CombosRepoCtx.Provider>;
}

export function useCombosRepo() {
    const ctx = useContext(CombosRepoCtx);
    if (!ctx) throw new Error('CombosRepoProvider is missing');
    return ctx;
}

