// src/lib/repos/combos.repo.mock.ts
import {ComboId, ComboMeta, CombosRepo} from "./combos.repo";
import {Movement} from "@/types/common";

const nowISO = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 10);

type Store = {
    metas: ComboMeta[];
    steps: Record<ComboId, Movement[]>;
};

const store: Store = {
    metas: [
        { id: "seed-1", userId: "demo", name: "Warmup 1", category: null, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    steps: {
        "seed-1": ["jab", "straight", "left_hook"],
    },
};

export const mockCombosRepo: CombosRepo = {
    async listCombos(userId) {
        return store.metas.filter(m => m.userId === userId)
            .sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    },
    async getCombo(userId, id) {
        const meta = store.metas.find(m => m.id === id && m.userId === userId);
        if (!meta) return null;
        const steps = store.steps[id] ?? [];
        return { meta, steps };
    },
    async createCombo(userId, meta, steps = []) {
        const id = rid();
        const m: ComboMeta = {
            id, userId,
            name: meta.name ?? "New Combo",
            category: meta.category ?? null,
            createdAt: nowISO(), updatedAt: nowISO()
        };
        store.metas.push(m);
        store.steps[id] = [...steps];
        return m;
    },

    // NEW
    async updateMeta(_userId, id, patch) {
        const m = store.metas.find(x => x.id === id);
        if (m) {
            if (patch.name !== undefined) m.name = patch.name;
            if (patch.category !== undefined) m.category = patch.category ?? null;
            m.updatedAt = nowISO();
        }
    },

    // keep legacy method if you still call it anywhere else
    async renameCombo(_userId, id, name) {
        const m = store.metas.find(x => x.id === id);
        if (m) { m.name = name; m.updatedAt = nowISO(); }
    },

    async deleteCombo(_userId, id) {
        store.metas = store.metas.filter(x => x.id !== id);
        delete store.steps[id];
    },
    async saveSteps(_userId, id, steps) {
        store.steps[id] = [...steps];
        const m = store.metas.find(x => x.id === id);
        if (m) m.updatedAt = nowISO();
    },
};
