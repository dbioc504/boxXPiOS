// src/screens/Timer/comboPlanner.ts
import type { ComboMeta } from "@/lib/repos/combos.repo";
import type { Category } from "@/types/common";

export const NO_CAT: "__NO_CAT__" = "__NO_CAT__";

type Buckets = Record<string, ComboMeta[]>;

export function groupByCategory(combos: ComboMeta[]): Buckets {
    const by: Buckets = {};
    const norm = (s?: string | null) => (s ?? NO_CAT);

    // keep original relative order inside each bucket
    for (const c of combos) {
        const k = norm(c.category);
        if (!by[k]) by[k] = [];
        by[k].push(c);
    }
    return by;
}

export function alignFocusSeqToAvailable(
    focusSeq: (Category | null | undefined)[],
    selected: ComboMeta[],
    startOffset = 0
): (Category | null)[] {
    const by = groupByCategory(selected);
    const avail = Object.keys(by).filter((k) => (by[k]?.length ?? 0) > 0);
    if (avail.length === 0) return focusSeq.map(() => null);

    const n = avail.length;
    const norm = (c: Category | null | undefined) => (c ?? NO_CAT) as string;

    const out: (Category | null)[] = [];
    for (let i = 0; i < focusSeq.length; i++) {
        const desired = norm(focusSeq[i]);
        let pick: string | null = null;

        if (by[desired]?.length) {
            pick = desired;
        } else  {
            const prev = out[i - 1] ? norm(out[i - 1]!) : null;
            for (let k = 0; k < n; k++) {
                const cand = avail[(startOffset + i + k) % n];
                if (by[cand]?.length && cand !== prev) {
                    pick = cand;
                    break;
                }
            }
            if (!pick) pick = avail[(startOffset + i) % n];
        }

        out.push(pick === NO_CAT ? null : (pick as Category));
    }
    return out;
}

export function buildComboRoundSchedule(
    rounds: number,
    selected: ComboMeta[],
    focusSeq: (Category | null | undefined)[],
    opts?: { strictFocus?: boolean }
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
    // Stable category list so rotation feels predictable
    const allCats = Object.keys(by).sort((a, b) => a.localeCompare(b));

    const catKey = (m: ComboMeta) => (m.category ?? NO_CAT);

    const roundsOut: ComboMeta[][] = Array.from({ length: r }, () => []);

    const queues: Record<string, ComboMeta[]> = {};
    for (const c of allCats) queues[c] = [];
    for (const item of bag) queues[catKey(item)]?.push(item);

    function tryPickFrom(cat: string, roundIdx: number, allowSameInRow: boolean): ComboMeta | null {
        const q = queues[cat];
        if (!q || q.length === 0) return null;

        if (!allowSameInRow) {
            const last = roundsOut[roundIdx].at(-1);
            if (last && catKey(last) === cat) return null;
        }

        return q.shift() ?? null;
    }

    function pickAnyBut(excludeCat: string | null, roundIdx: number): ComboMeta | null {
        for (const c of allCats) {
            if (excludeCat && c === excludeCat) continue;
            const got = tryPickFrom(c, roundIdx, false);
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

        let first: ComboMeta | null = null;

        if (focusKey && focusKey !== prevFirstCat) {
            first = tryPickFrom(focusKey, i, opts?.strictFocus === true);
        }
        if (!first) first = pickAnyBut(prevFirstCat, i);
        if (first) roundsOut[i].push(first);

        while (roundsOut[i].length < want) {
            let next: ComboMeta | null = null;
            if (focusKey) next = tryPickFrom(focusKey, i, opts?.strictFocus === true);

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

/**
 * Derive a per-round focus sequence by rotating a stable category list.
 * @param rounds
 * @param selected
 * @param startOffset - rotates the first category across launches.
 */
export function deriveFocusSeqFromCombos(
    rounds: number,
    selected: ComboMeta[],
    startOffset = 0
): (Category | null)[] {
    const by = groupByCategory(selected);
    let keys = Object.keys(by);

    if (keys.length === 0) return Array.from({ length: rounds }, () => null);

    // Stable alpha order; keeps NO_CAT grouped consistently
    keys = keys.sort((a, b) => a.localeCompare(b));
    const n = keys.length;
    const start = (startOffset % n + n) % n;

    const out: (Category | null)[] = [];
    for (let i = 0; i < rounds; i++) {
        const pick = keys[(start + i) % n];
        // avoid immediate repeats if rounds > categories by nudging to the next
        const prev = out.at(-1) ?? null;
        if (prev && String(prev) === String(pick)) {
            out.push(keys[(start + i + 1) % n] as Category);
        } else {
            out.push(pick as Category);
        }
    }
    return out;
}

export const COMBO_PLAN_STORE_KEY = "combo_plan.v1";
export type ComboRound = { roundIndex: number; comboIds: string[] };
export type ComboPlanSaved = { rounds: number; roundsMap: ComboRound[]; createdAt: number };
