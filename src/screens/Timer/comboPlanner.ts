import type { ComboMeta } from "@/lib/repos/combos.repo";
import type { Category } from "@/types/common";

export const NO_CAT: "__NO_CAT__" = "__NO_CAT__";

type Buckets = Record<string, ComboMeta[]>;

export function groupByCategory(combos: ComboMeta[]): Buckets {
    const by: Buckets = {};
    const norm = (s?: string | null) => (s ?? NO_CAT);

    for (const c of combos) {
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
    const n = selected.length;
    if (n === 0) return Array.from({ length: r }, () => []);

    const perRound = Math.max(1, Math.ceil(n / r));
    const totalSlots = perRound * r;

    const base = Math.floor(totalSlots / n);
    let extra = totalSlots % n;

    const bag: ComboMeta[] = [];
    for (let i = 0; i < n; i++) {
        const times = base + (i < extra ? 1 : 0);
        for (let t = 0; t < times; t++) bag.push(selected[i]);
    }

    const by = groupByCategory(selected);
    const allCats = Object.keys(by);

    const catKey = (m: ComboMeta) => (m.category ?? NO_CAT);

    const roundsOut: ComboMeta[][] = Array.from({ length: r }, () => []);

    const queues: Record<string, ComboMeta[]> = {};
    for (const c of allCats) queues[c] = [];
    for (const item of bag) queues[catKey(item)]?.push(item);

    function tryPickFrom(cat: string, roundIdx: number): ComboMeta | null {
        const q = queues[cat];
        if (!q || q.length === 0) return null;

        const last = roundsOut[roundIdx].at(-1);
        if (last && catKey(last) === cat) return null;

        return q.shift() ?? null;
    }

    function pickAnyBut(excludeCat: string | null, roundIdx: number): ComboMeta | null {
        for (const c of allCats) {
            if (excludeCat && c === excludeCat) continue;
            const got = tryPickFrom(c, roundIdx);
            if (got) return got;
        }
        for (const c of allCats) {
            const q = queues[c];
            if (q?.length) return q.shift()!;
        }
        return null;
    }

    for (let i = 0; i < r; i++) {
        const want = perRound;
        const focus = (focusSeq[i] ?? null) as Category | null;
        const focusKey = (focus ?? NO_CAT) as string;

        const prevFirst = roundsOut[i - 1]?.[0] ?? null;
        const prevFirstCat = prevFirst ? catKey(prevFirst) : null;

        let first = null as ComboMeta | null;

        if (focusKey && focusKey !== prevFirstCat) {
            first = tryPickFrom(focusKey, i);
        }

        if (!first) {
            first = pickAnyBut(prevFirstCat, i);
        }
        if (first) roundsOut[i].push(first);

        while (roundsOut[i].length < want) {
            let next = null as ComboMeta | null;
            if (focusKey) next = tryPickFrom(focusKey, i);

            if (!next) {
                const last = roundsOut[i].at(-1);
                const lastCat = last ? catKey(last) : null;
                next = pickAnyBut(lastCat, i);
            }

            if (!next) break;
            roundsOut[i].push(next);
        }
    }

    return roundsOut;
}

export function deriveFocusSeqFromCombos(
    rounds: number,
    selected: ComboMeta[],
): (Category | null)[] {
    const by = groupByCategory(selected);
    const keys = Object.keys(by);
    if (keys.length === 0) return Array.from({ length: rounds }, () => null);

    const out: (Category | null)[] = [];
    let idx = 0;
    for (let i = 0; i < rounds; i++) {
        const last = out.at(-1) ?? null;
        let pick = keys[idx % keys.length];
        if (last && pick === last) {
            pick = keys[(idx + 1) % keys.length];
            idx += 1;
        }
        out.push(pick as Category);
        idx += 1;
    }
    return out;
}

export const COMBO_PLAN_STORE_KEY = "combo_plan.v1"
export type ComboRound = { roundIndex: number; comboIds: string[] };
export type ComboPlanSaved = { rounds: number; roundsMap: ComboRound[]; createdAt: number };