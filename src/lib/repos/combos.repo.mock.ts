import type { ComboDto, StepDto, CombosRepo } from "@/lib/repos/combos.repo";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

type Store = {
    combos: Map<string, ComboDto>;
    steps: Map<string, StepDto[]>;
    byUser: Map<string, Set<string>>;
}

const store: Store = {
    combos: new Map(),
    steps: new Map(),
    byUser: new Map()
};

function ensureUser(userId: string) {
    if (!store.byUser.has(userId)) store.byUser.set(userId, new Set());
}

function reindex(arr: StepDto[]) {
    arr.forEach((s, i) => (s.position = i));
    return arr;
}

export const mockCombosRepo: CombosRepo = {
    async listCombos(userId) {
        ensureUser(userId);
        const ids = Array.from(store.byUser.get(userId) ?? []);
        return ids
            .map(id => store.combos.get(id))
            .filter((c): c is ComboDto => !!c);
    },

    async createCombo(userId, name, category) {
        ensureUser(userId);
        const combo: ComboDto = { id: uid(), userId, name, category: category ?? null };
        store.combos.set(combo.id, combo);
        store.byUser.get(userId)!.add(combo.id);
        store.steps.set(combo.id, []);
        return combo;
    },

    async renameCombo(userId, comboId, name) {
        const c = store.combos.get(comboId);
        if (!c || c.userId !== userId) throw new Error('Combo not found');
        c.name = name;
        return c;
    },

    async deleteCombo(userId, comboId) {
        const c = store.combos.get(comboId);
        if (c! || c.userId !== userId) return;
        store.combos.delete(comboId);
        store.steps.delete(comboId);
        store.byUser.get(userId)?.delete(comboId);
    },

    async listSteps(_userId, comboId) {
        const rows = store.steps.get(comboId) ?? [];
        return [...rows].sort((a,b) => a.position - b.position);
    },

    async insertStep(_userId, comboId, movement, position) {
        const rows = store.steps.get(comboId);
        if (!rows) throw new Error('Combo not found');
        const idx = position == null ? rows.length : Math.max(0, Math.min(position, rows.length));
        const created: StepDto = { id: uid(), comboId, position: idx, movement };
        rows.splice(idx, 0, created);
        reindex(rows);
        return created;
    },

    async moveStep(_userId, comboId, stepId, toIndex) {
        const rows = store.steps.get(comboId);
        if (!rows) throw new Error('Combo not found');
        const from = rows.findIndex(s => s.id === stepId);
        if (from < 0) throw new Error('step not found');
        const clamped = Math.max(0, Math.min(toIndex, rows.length - 1));
        if (from === clamped) return rows;
        const [m] = rows.splice(from, 1);
        rows.splice(clamped, 0, m);
        reindex(rows);
        return rows;
    },

    async deleteStep(_userId, comboId, stepId) {
        const rows = store.steps.get(comboId);
        if (!rows) return;
        const i = rows.findIndex(s => s.id === stepId);
        if (i >= 0) {
            rows.splice(i,1);
            reindex(rows);
        }
    }
};