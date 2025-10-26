import type { ComboMeta } from "@/lib/repos/combos.repo";
import type { Category } from "@/types/common";

export const NO_CAT: "__NO_CAT__" = "__NO_CAT__";

type Buckets = Record<string, ComboMeta[]>;

export function groupByCategory(combos: ComboMeta[]): Buckets {
    const by: Buckets = {};
    const norm = (s?: string | null) => (s ?? NO_CAT);

    const sorted = [...combos].sort((a,b) => {
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        if (an !== bn) return an.localeCompare(bn);
        return a.id.localeCompare(b.id);
    });

    for (const c of sorted) {
        const k = norm(c.category);
        if (!by[k]) by[k] = [];
        by[k].push(c);
    }
    return by;
}

export function buildComboRoundSchedule(
    rounds: number,
    selected: ComboMeta[],
    focusSeq: (Category | null | undefined)[],
): ComboMeta[][] {
    const r = Math.max(1, rounds);
    const total = selected.length;
    if (total === 0) return Array.from({ length: r }, () => []);

    const perRound = Math.ceil(total / r);

    const buckets = groupByCategory(selected);
    const cats = Object.keys(buckets);

    const take = (k: string, n: number): ComboMeta[] => {
        const q = buckets[k] ?? [];
        if (!q.length || n <= 0) return [];
        return q.splice(0, Math.min(n, q.length));
    };

    const out: ComboMeta[][] = Array.from({ length: r }, () => []);
    for (let i = 0; i < r; i++) {
        const want = perRound;
        const focus = (focusSeq[i] ?? null) as Category | null;
        const focusKey = focus ?? NO_CAT;

        let need = want;
        if (focusKey && buckets[focusKey]) {
            const picked = take(focusKey, need);
            out[i].push(...picked);
            need -= picked.length;
        }

        if (need > 0) {
            const others = cats
                .filter((k) => k !== focusKey)
                .slice(i % cats.length)
                .concat(cats.filter((k) => k !== focusKey).slice(0, i % cats.length));

            for (const k of others) {
                if (need <= 0) break;
                const picked = take(k, need);
                if (picked.length) {
                    out[i].push(...picked);
                    need -= picked.length;
                }
            }
        }
    }

    const remaining = cats.reduce((acc, k) => acc + (buckets[k]?.length ?? 0), 0);
    if (remaining > 0) {
        for (let i = 0; i < r; i++) {
            const need = Math.max(0, perRound - out[i].length);
            if (!need) continue;
            for (const k of cats) {
                if (out[i].length >= perRound) break;
                const takeN = perRound - out[i].length;
                const picked = take(k, takeN);
                if (picked.length) out[i].push(...picked);
            }
        }
    }

    return out;
}

export function deriveFocusSeqFromCombos(
    rounds: number,
    selected: ComboMeta[],
): (Category | null)[] {
    const by = groupByCategory(selected);
    const keys = Object.keys(by).filter((k) => k !== NO_CAT);
    if (keys.length === 0) return Array.from({ length: rounds }, () => null);

    return Array.from({ length: rounds }, (_, i) => (keys[i % keys.length] as Category));
}
