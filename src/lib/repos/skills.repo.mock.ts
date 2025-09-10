import type { SkillsRepo, Style, TechniqueRow } from "@/lib/repos/skills.repo";
import { TECHNIQUES } from "@/lib/fixtures";

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
    };
}