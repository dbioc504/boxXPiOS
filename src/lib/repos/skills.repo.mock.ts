import type {SkillsRepo, Style} from "@/lib/repos/skills.repo";
import {makeUuidV7, TECHNIQUES} from "@/lib/fixtures";
import type {Technique} from "@/types/technique";
import type {Category} from "@/types/common";
import type { TechniqueRow } from "@/types/validation";

const userStyle = new Map<string, Style>();
const userTechs = new Map<string, Map<string, Set<string>>>();

function ensureUserCat(userId: string, cat: Category) {
    if (!userTechs.has(userId)) userTechs.set(userId, new Map());
    const byCat = userTechs.get(userId)!;
    if (!byCat.has(cat)) byCat.set(cat, new Set());
    return byCat.get(cat)!;
}

const userTechObjects = new Map<string, Technique[]>();
const objKey = (userId: string, category: Category) => `${userId}:${category}`;

export function makeMockSkillsRepo(): SkillsRepo {
    return {
        async listUserTechniques(userId: string, category: Category): Promise<Technique[]> {
            const k = objKey(userId, category);
            let arr = userTechObjects.get(k);
            if (!arr) {
                const ids = await this.getUserTechniques(userId, category);
                const allByCat = await this.listTechniquesByCategory(category);
                const byId = new Map<string, TechniqueRow>(allByCat.map(t => [t.id, t] as const));
                const now = new Date().toISOString();

                arr = ids
                    .map((id) => {
                        const base = byId.get(id);
                        if (!base) return null;
                        return {
                            id: base.id,
                            title: base.title,
                            category,
                            createdAt: now,
                            updatedAt: now,
                        } as Technique;
                    })
                    .filter(Boolean) as Technique[];

                userTechObjects.set(k, arr);
            }
            return arr;
        },

        async createUserTechnique(userId: string, category: Category, title: string): Promise<Technique> {
            const t: Technique = {
                id: makeUuidV7(Date.now()),
                title,
                category
            }
            const k = `${userId}:${category}`;
            const arr = userTechObjects.get(k) ?? [];
            userTechObjects.set(k, [t, ...arr]);

            ensureUserCat(userId,category).add(t.id);

            return t;
        },

        async updateUserTechnique(userId: string, id: string, patch: { title?: string }): Promise<void> {
            for (const [k, arr] of userTechObjects.entries()) {
                if (!k.startsWith(`${userId}:`)) continue;
                const next = arr.map(t =>
                    t.id === id ? { ...t, ...(patch.title ? { title: patch.title } : {}) } : t
                );
                userTechObjects.set(k, next);
                return;
            }
        },

        async deleteUserTechnique(userId: string, id: string): Promise<void> {
            // Remove from object store
            for (const [k, arr] of userTechObjects.entries()) {
                if (!k.startsWith(`${userId}:`)) continue;
                const next = arr.filter((t) => t.id !== id);
                if (next.length !== arr.length) userTechObjects.set(k, next);
            }
            // Remove from legacy id store across categories for this user
            const byCat = userTechs.get(userId);
            if (byCat) {
                for (const [, set] of byCat.entries()) {
                    if (set.has(id)) set.delete(id);
                }
            }
        },

        // ---------- existing methods you already had ----------
        async getUserStyle(userId) {
            return userStyle.get(userId) ?? null;
        },
        async setUserStyle(userId, style) {
            userStyle.set(userId, style);
        },

        async listTechniquesByCategory(cat) {
            // fixtures list used by the old flow and for seeding
            return TECHNIQUES.filter((t: TechniqueRow) => t.category === cat);
        },

        async getUserTechniques(userId, cat: Category) {
            const set = ensureUserCat(userId, cat);
            return Array.from(set);
        },

        async setUserTechniques(userId, cat: Category, ids) {
            const set = ensureUserCat(userId, cat);
            set.clear();
            ids.forEach((id) => set.add(id));
        },
    };
}
