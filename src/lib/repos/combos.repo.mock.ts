// src/lib/repos/combos.repo.mock.ts
import { CombosRepo, ComboMeta, ComboId } from "./combos.repo";
import { Movement } from "@/types/common";

const nowISO = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 10);

type Store = {
    metas: ComboMeta[];                 // no userId here in the public shape
    steps: Record<ComboId, Movement[]>;
};

const store: Store = {
    metas: [{ id: "seed-1", name: "Warmup 1", category: null, createdAt: nowISO(), updatedAt: nowISO() }],
    steps: { "seed-1": ["jab", "straight", "left_hook"] },
};

export const mockCombosRepo: CombosRepo = {
    async listCombos() {
        return store.metas.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async getCombo(id) {
        const meta = store.metas.find(m => m.id === id);
        if (!meta) return null;
        const steps = store.steps[id] ?? [];
        return { meta, steps };
    },
    async createCombo(meta, steps = []) {
        const id = rid();
        const m: ComboMeta = {
            id,
            name: meta.name ?? "New Combo",
            category: meta.category ?? null,
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };
        store.metas.push(m);
        store.steps[id] = [...steps];
        return m;
    },
    async updateMeta(id, patch) {
        const m = store.metas.find(x => x.id === id);
        if (m) {
            if (patch.name !== undefined) m.name = patch.name;
            if (patch.category !== undefined) m.category = patch.category ?? null;
            m.updatedAt = nowISO();
        }
    },

    async deleteCombo(id) {
        store.metas = store.metas.filter(x => x.id !== id);
        delete store.steps[id];
    },
    async saveSteps(id, steps) {
        store.steps[id] = [...steps];
        const m = store.metas.find(x => x.id === id);
        if (m) m.updatedAt = nowISO();
    },
};
