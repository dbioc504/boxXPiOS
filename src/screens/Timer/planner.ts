// src/lib/skills/planner.ts
import type { Technique } from "@/types/technique";
import type { Category } from "@/types/common";

export type RoundPlan = {
    roundIndex: number;
    categoryFocus: Category | null;
    techniques: Technique[];
};

type ByCategory = Record<Category, Technique[]>;

function cloneQueues(groups: ByCategory): Record<Category, Technique[]> {
    const copy: Record<Category, Technique[]> = {} as any;
    (Object.keys(groups) as Category[]).forEach((c) => {
        copy[c] = groups[c]?.slice?.() ?? [];
    });
    return copy;
}

function totalSize(groups: ByCategory): number {
    return (Object.keys(groups) as Category[]).reduce(
        (acc, c) => acc + ((groups[c]?.length ?? 0) as number),
        0
    );
}

function categoriesInStyle(groups: ByCategory): Category[] {
    // stable alphabetical order so rotation feels predictable across sessions
    return (Object.keys(groups) as Category[])
        .filter((c) => (groups[c]?.length ?? 0) > 0)
        .sort((a, b) => String(a).localeCompare(String(b)));
}

function roundCounts(totalSlots: number, rounds: number): number[] {
    const r = Math.max(1, rounds);
    const base = Math.floor(totalSlots / r);
    const rem = totalSlots % r;
    return Array.from({ length: r }, (_, i) => base + (i < rem ? 1 : 0));
}

function takeFromQueue(q: Technique[], k: number): Technique[] {
    const taken: Technique[] = [];
    let need = Math.max(0, k);
    while (need > 0 && q.length > 0) {
        taken.push(q.shift()!);
        need -= 1;
    }
    return taken;
}

function fillFromRotatingQueues(
    k: number,
    primary: Category | null,
    order: Category[],
    queues: Record<Category, Technique[]>
): { list: Technique[] } {
    const out: Technique[] = [];

    const tryPull = (cat: Category | null, need: number) => {
        if (!cat) return 0;
        const pulled = takeFromQueue(queues[cat] ?? [], need);
        if (pulled.length) out.push(...pulled);
        return pulled.length;
    };

    let remaining = Math.max(0, k);

    if (primary) remaining -= tryPull(primary, remaining);

    if (remaining > 0) {
        for (let i = 0; i < order.length && remaining > 0; i++) {
            const c = order[i];
            if (c === primary) continue;
            remaining -= tryPull(c, remaining);
        }
    }

    // If still short, cycle one-by-one across whatever's left
    let idx = 0;
    while (remaining > 0 && order.length > 0) {
        const c = order[idx % order.length];
        remaining -= tryPull(c, 1);
        idx += 1;

        // break if nothing is left anywhere
        const anyLeft = order.some((cat) => (queues[cat]?.length ?? 0) > 0);
        if (!anyLeft) break;
    }

    // de-dupe just in case
    const seen = new Set<string>();
    const uniqueOut = out.filter((t) => {
        if (!t?.id) return false;
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
    });

    return { list: uniqueOut };
}

/**
 * BALANCED with rotating start.
 * @param rounds
 * @param groups
 * @param startOffset - which category index to start with this time (rotates across launches)
 */
export function planBalanced(
    rounds: number,
    groups: ByCategory,
    startOffset = 0
): RoundPlan[] {
    const cats = categoriesInStyle(groups);
    const total = totalSize(groups);
    if (rounds <= 0 || total === 0) {
        return Array.from({ length: Math.max(0, rounds) }, (_, i) => ({
            roundIndex: i,
            categoryFocus: cats[0] ?? null,
            techniques: [],
        }));
    }

    const queues = cloneQueues(groups);
    const counts = roundCounts(total, rounds);

    const plans: RoundPlan[] = [];
    const nCats = cats.length;
    const baseOffset = nCats > 0 ? (startOffset % nCats + nCats) % nCats : 0;

    for (let r = 0; r < rounds; r++) {
        const k = counts[r];
        const focusIdx = nCats > 0 ? (baseOffset + r) % nCats : 0;
        const focus = nCats > 0 ? cats[focusIdx] : null;

        // borrow order begins at this round's focus, then wraps
        const borrowOrder =
            nCats > 0
                ? cats.slice(focusIdx).concat(cats.slice(0, focusIdx))
                : [];

        const { list } = fillFromRotatingQueues(k, focus, borrowOrder, queues);
        plans.push({ roundIndex: r, categoryFocus: focus, techniques: list });
    }
    return plans;
}
// SPECIALIZED
// Add opts.noRepeats: if true, do not top-up beyond the unique pool (global uniqueness).
export function planSpecialized(
    rounds: number,
    groups: ByCategory,
    selected: Category,
    targetShare = 0.7,
    opts?: { noRepeats?: boolean }
): RoundPlan[] {
    const cats = categoriesInStyle(groups);
    const totalUnique = totalSize(groups);
    if (rounds <= 0 || totalUnique === 0) {
        return Array.from({ length: Math.max(0, rounds) }, (_, i) => ({
            roundIndex: i,
            categoryFocus: selected ?? null,
            techniques: [],
        }));
    }

    const selectedCount = groups[selected]?.length ?? 0;

    // If no repeats are allowed, the total slots are capped at totalUnique (one pass over the pool).
    const totalSlots = opts?.noRepeats
        ? totalUnique
        : Math.max(totalUnique, Math.ceil(selectedCount / targetShare));

    const counts = roundCounts(totalSlots, rounds);

    // Build focus sequence (bias selected to ~targetShare of rounds)
    const selectedRounds = Math.round(rounds * targetShare);
    const otherRounds = rounds - selectedRounds;
    const others = cats.filter((c) => c !== selected);

    const focusSeq: (Category | null)[] = [];
    let selLeft = selectedRounds;
    let othLeft = otherRounds;
    let iOther = 0;

    for (let r = 0; r < rounds; r++) {
        const wantSelected = selLeft > 0 && selLeft / (rounds - r) >= targetShare;
        if (wantSelected && focusSeq[focusSeq.length - 1] !== selected) {
            focusSeq.push(selected);
            selLeft -= 1;
        } else if (othLeft > 0 && others.length > 0) {
            const c = others[iOther % others.length];
            if (focusSeq[focusSeq.length - 1] === c && selLeft > 0) {
                focusSeq.push(selected);
                selLeft -= 1;
            } else {
                focusSeq.push(c);
                othLeft -= 1;
                iOther += 1;
            }
        } else if (selLeft > 0) {
            focusSeq.push(selected);
            selLeft -= 1;
        } else {
            focusSeq.push(others[0] ?? selected ?? null);
        }
    }

    // Initial distribution — consumes queues (unique by construction)
    const queues = cloneQueues(groups);
    const plans: RoundPlan[] = [];
    for (let r = 0; r < rounds; r++) {
        const k = counts[r];
        const focus = focusSeq[r] ?? selected;
        const borrowOrder = [focus, ...cats.filter((c) => c !== focus)];
        const { list } = fillFromRotatingQueues(k, focus, borrowOrder as Category[], queues);
        plans.push({ roundIndex: r, categoryFocus: focus, techniques: list });
    }

    if (opts?.noRepeats) {
        // No top-up pass at all — we’re done. This guarantees global uniqueness.
        return plans;
    }

    // Otherwise, keep your original top-up to approach targetShare (could repeat globally).
    const shownSelected = plans.reduce(
        (acc, rp) => acc + rp.techniques.filter((t) => t.category === selected).length,
        0
    );
    const targetSelected = Math.ceil(totalSlots * targetShare);
    let needMore = Math.max(0, targetSelected - shownSelected);

    if (needMore > 0 && selectedCount > 0) {
        const pool = (groups[selected] ?? []).slice();
        let pIdx = 0;

        for (let r = 0; r < rounds && needMore > 0; r++) {
            const rp = plans[r];
            const existingIds = new Set(rp.techniques.map((t) => t.id));
            let addedHere = 0;

            let attempts = 0;
            const maxAttempts = pool.length * 2;

            while (needMore > 0 && addedHere < 2 && attempts < maxAttempts) {
                const pick = pool[pIdx % pool.length];
                pIdx += 1;
                attempts += 1;

                if (!existingIds.has(pick.id)) {
                    rp.techniques.push(pick);
                    existingIds.add(pick.id);
                    addedHere += 1;
                    needMore -= 1;
                }
            }
        }
    }

    return plans;
}
