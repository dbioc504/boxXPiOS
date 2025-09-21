import type { SkillsRepo, Style, TechniqueRow } from "@/lib/repos/skills.repo";
import { TECHNIQUES } from "@/lib/fixtures";
import {Technique} from "@/types/technique";
import {is} from "zod/locales";
import {Category} from "@/types/common";

const userStyle = new Map<string, Style>();
const userTechs = new Map<string, Map<string, Set<string>>>;

function ensureUserCat(userId: string, cat: string) {
    if (!userTechs.has(userId)) userTechs.set(userId, new Map());
    const byCat = userTechs.get(userId)!;
    if (!byCat.has(cat)) byCat.set(cat, new Set());
    return byCat.get(cat)!;
}

export function makeMockSkillsRepo(): SkillsRepo {
    return {
        createUserTechnique(userId: string, category: Category, title: string): Promise<Technique> {
            return Promise.resolve(undefined);
        }, deleteUserTechnique(userId: string, id: string): Promise<void> {
            return Promise.resolve(undefined);
        }, updateUserTechnique(userId: string, id: string, patch: { title?: string }): Promise<void> {
            return Promise.resolve(undefined);
        },
        async getUserStyle(userId) {
            return userStyle.get(userId) ?? null;
        },
        async setUserStyle(userId, style) {
            userStyle.set(userId, style);
        },
        async listTechniquesByCategory(cat) {
            return TECHNIQUES.filter((t: TechniqueRow) => t.category === cat);
        },
        async getUserTechniques(userId, cat) {
            const set = ensureUserCat(userId, cat);
            return Array.from(set);
        },
        async setUserTechniques(userId,cat, ids) {
            const set = ensureUserCat(userId, cat);
            set.clear();
            ids.forEach(id => set.add(id));
        },
        async listUserTechniques(userId, category): Promise<Technique[]> {
            const ids = await this.getUserTechniques(userId, category);
            const allByCat = await this.listTechniquesByCategory(category);
            const byId = new Map(allByCat.map(t => [t.id, t]));
            return ids.map(id => byId.get(id)).filter((t): t is Technique => Boolean(t));
        }
    };
}