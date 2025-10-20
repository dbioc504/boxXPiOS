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
    (Object.keys(groups) as Category[]).forEach(c => {
        copy[c] = groups[c]?.slice() ?? [];
    })
    return copy;
}

function totalSize(groups: ByCategory): number {
    return (Object.keys(groups) as Category[]).reduce((acc, c) => acc + (groups[c].length ?? 0), 0);
}

function categoriesInStyle(groups: ByCategory): Category[] {
    return (Object.keys(groups) as Category[]).filter(c => (groups[c].length ?? 0) > 0);
}

function roundCounts(totalSlots: number, rounds: number): number[] {
    const base = Math.floor(totalSlots / rounds);
    const rem = totalSlots % rounds;
    return Array.from({ length: rounds }, (_, i) => base + (i < rem ? 1 : 0));
}

function takeFromQueue(q: Technique[], k: number): Technique[] {
    const taken: Technique[] = [];
    while (k > 0 && q.length > 0) {
        taken.push(q.shift()!);
        k -= 1;
    }
    return taken;
}

function fillFromRotatingQueus(
    k: number,
    primary: Category | null,
    order: Category[],
    queues: Record<Category, Technique[]>
): { list: Technique[] } {
    const out: Technique[] = [];

    const tryPull = (cat: Category | null, need: number) => {
        if (!cat) return 0;
        const pulled = takeFromQueue(queues[cat], need);
        if (pulled.length) out.push(...pulled);
        return pulled.length;
    };

    let remaining = k;

    if (primary) {
        remaining -= tryPull(primary, remaining);
    }

    if (remaining > 0) {
        for (let i = 0; i < order.length && remaining > 0; i++) {
            const c = order[i];
            if (c === primary) continue;
            remaining -= tryPull(c, remaining);
        }
    }

    let idx = 0;
    while (remaining > 0 && order.length > 0) {
        const c = order[idx % order.length];
        remaining -= tryPull(c, 1);
        idx += 1;
    }

    return { list: out };
}

export function planBalanced(rounds: number, groups: ByCategory): RoundPlan[] {
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
    for (let r = 0; r < rounds; r++) {
        const k = counts[r];
        const focus = cats[r % cats.length];
        const borrowOrder = cats.slice(r % cats.length).concat(cats.slice(0, r % cats.length));
        const { list } = fillFromRotatingQueus(k, focus, borrowOrder, queues);
        plans.push({ roundIndex: r, categoryFocus: focus, techniques: list });
    }
    return plans;
}

export function planSpecialized(
    rounds: number,
    groups: ByCategory,
    selected: Category,
    targetShare = 0.7
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

    const sMinForShare = Math.ceil(selectedCount / targetShare);
    const totalSlots = Math.max(totalUnique, sMinForShare);
    const counts = roundCounts(totalSlots, rounds);

    const selectedRounds = Math.round(rounds * targetShare);
    const otherRounds = rounds - selectedRounds;
    const others = cats.filter(c => c !== selected);

    const focusSeq: (Category | null)[] = [];
    let selLeft = selectedRounds;
    let othLeft = otherRounds;
    let iOther = 0;

    for (let r = 0; r < rounds; r++) {
        const wantSelected = selLeft > 0 && (selLeft / (rounds - r)) >= targetShare;
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

    const queues = cloneQueues(groups);
    const plans: RoundPlan[] = [];
    for (let r = 0; r < rounds; r++) {
        const k = counts[r];
        const focus = focusSeq[r] ?? selected;
        const borrowOrder = [focus, ...cats.filter(c => c !== focus)];
        const { list } = fillFromRotatingQueus(k, focus, borrowOrder as Category[], queues);
        plans.push({ roundIndex: r, categoryFocus: focus, techniques: list });
    }

    const shownSelected = plans.reduce(
        (acc, rp) => acc + rp.techniques.filter(t => t.category === selected).length, 0
    );
    const targetSelected = Math.ceil(totalSlots * targetShare);
    let needMore = Math.max(0, targetSelected - shownSelected);

    if (needMore > 0 && selectedCount > 0) {
        const pool = groups[selected].slice();
        let pIdx = 0;
        for (let r=0; r < rounds && needMore > 0; r++) {
            const rp = plans[r];
            const toAdd = Math.min(needMore, 2);
            for (let a = 0; a < toAdd && needMore > 0; a++) {
                const pick = pool[pIdx % pool.length];
                rp.techniques.push(pick);
                pIdx += 1;
                needMore -= 1;
            }
        }
    }
    return plans;
}

