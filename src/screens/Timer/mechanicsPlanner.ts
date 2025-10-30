import type { Category } from "@/types/common";
import type { Mechanic, MechanicMovementItem, MechanicsGroup } from "@/types/mechanic";

export const MECH_PLAN_STORE_KEY = "mechanics_plan.v1";

type BucketsByGroup = Record<MechanicsGroup, Mechanic[]>;
type MovementIndex = Record<Category, Record<MechanicsGroup, Mechanic[]>>;
type NeutralByGroup = Record<MechanicsGroup, Mechanic[]>;

export type MechRound = { roundIndex: number; mechanicIds: string[] };
export type MechanicsPlanSaved = {
    rounds: number;
    roundsMap: MechRound[];
    createdAt: number;
};

export type BuildOpts = {
    focusSeq: (MechanicsGroup | null | undefined)[];
    targetCategorySeq?: (Category | null | undefined)[];
    strictFocus?: boolean;
};

const asId = (m: Mechanic) =>
    m.kind === "movement" ? m.id : m.id;

export function groupByGroup(items: Mechanic[]): BucketsByGroup {
    const out = {} as BucketsByGroup;
    for (const m of items) {
        (out[m.group] ??= []).push(m);
    }
    return out;
}

export function indexByCategory(items: Mechanic[]): {
    byCategoryInGroup: MovementIndex;
    neutralByGroup: NeutralByGroup;
} {
    const byCategoryInGroup = {} as MovementIndex;
    const neutralByGroup = {} as NeutralByGroup;

    for (const m of items) {
        if (m.kind === "movement" && m.category?.length) {
            for (const cat of m.category) {
                byCategoryInGroup[cat] ??= {} as Record<MechanicsGroup, MechanicMovementItem[]>;
                (byCategoryInGroup[cat][m.group] ??= []).push(m);
            }
        } else {
            (neutralByGroup[m.group] ??= []).push(m);
        }
    }
    return { byCategoryInGroup, neutralByGroup };
}

export function deriveFocusSeqFromGroups(
    rounds: number,
    activeGroups: MechanicsGroup[],
    startOffset = 0
): (MechanicsGroup | null)[] {
    if (!activeGroups.length) {
        return Array.from({ length: rounds }, () => null);
    }
    const groups = [...activeGroups].sort((a, b) => a.localeCompare(b)); // stable
    const n = groups.length;
    const start = ((startOffset % n) + n) % n;

    const seq: (MechanicsGroup | null)[] = [];
    for (let i = 0; i < rounds; i++) {
        const g = groups[(start + i) % n];
        // avoid immediate repeats if rounds > groups
        if (seq.length && seq[seq.length - 1] === g) {
            seq.push(groups[(start + i + 1) % n]);
        } else {
            seq.push(g);
        }
    }
    return seq;
}

export function alignFocusSeqToAvailableForCategory(
    focusSeqGroups: (MechanicsGroup | null | undefined)[],
    targetCategorySeq: (Category | null | undefined)[],
    items: Mechanic[]
): (MechanicsGroup | null)[] {
    const { byCategoryInGroup, neutralByGroup } = indexByCategory(items);

    const allGroups = Array.from(
        new Set(items.map((m) => m.group))
    ).sort((a,b) => a.localeCompare(b));

    const pickFirstAvailable = (
        exclude: MechanicsGroup | null,
        target: Category | null | undefined
    ): MechanicsGroup | null => {
        if (target != null) {
            for (const g of allGroups) {
                if (exclude && g === exclude) continue;
                if (byCategoryInGroup[target]?.[g]?.length) return g;
            }
        }
        for (const g of allGroups) {
            if (exclude && g === exclude) continue;
            if (neutralByGroup[g]?.length) return g;
        }
        for (const g of allGroups) {
            if (exclude && g === exclude) continue;
            if (items.some((m) => m.group === g)) return g;
        }
        return null;
    };

    const out: (MechanicsGroup | null)[] = [];
    for (let i=0; i < focusSeqGroups.length; i++) {
        const desired = focusSeqGroups[i] ?? null;
        const prev = out[i - 1] ?? null;
        const target = targetCategorySeq[i] ?? null;

        let next: MechanicsGroup | null = null;

        if (desired) {
            const okForTarget =
                target == null ||
                !!indexByCategory(items).byCategoryInGroup[target]?.[desired] ||
                !!indexByCategory(items).neutralByGroup[desired] ||
                items.some((m) => m.group === desired);
            if (okForTarget) next = desired;
        }

        if (!next) {
            next = pickFirstAvailable(prev, target);
            if (!next && desired) next = desired;
        }
        out.push(next);
    }
    return out;
}

export function buildMechanicRoundSchedule(
    rounds: number,
    items: Mechanic[],
    opts: BuildOpts
): Mechanic[][] {
    const R = Math.max(1, rounds);
    if (!items.length) return Array.from({ length: R }, () => []);

    const byGroup = groupByGroup(items);
    const { byCategoryInGroup, neutralByGroup } = indexByCategory(items);

    const perRound = Math.max(1, Math.ceil(items.length / R));

    const qByGroup: Record<MechanicsGroup, Mechanic[]> = {} as any;
    for (const g of Object.keys(byGroup) as MechanicsGroup[]) {
        qByGroup[g] = byGroup[g].slice();
    }

    const roundsOut: Mechanic[][] = Array.from({ length: R }, () => []);

    const tryFrom = (
        g: MechanicsGroup,
        roundIdx: number,
        allowSameInRow: boolean,
        target?: Category | null | undefined
    ): Mechanic | null => {
        const row = roundsOut[roundIdx];
        const last = row.at(-1);
        if (!allowSameInRow && last && last.group === g) return null;

        if (target != null && byCategoryInGroup[target]?.[g]?.length) {
            const allowedIds = new Set(
                byCategoryInGroup[target][g].map((m) => m.id)
            );
            const q = qByGroup[g];
            for (let i = 0; i < q.length; i++) {
                if (allowedIds.has(q[i].id)) {
                    const [pick] = q.splice(i, 1);
                    return pick;
                }
            }
        }

        const q = qByGroup[g];
        if (q.length) return q.shift()!;

        return  null;
    };

    const pickAny = (
        roundIdx: number,
        excludeGroup?: MechanicsGroup | null
    ): Mechanic | null => {
        const allGroups = Object.keys(qByGroup).sort((a,b) =>
            a.localeCompare(b)
        ) as MechanicsGroup[];
        for (const g of allGroups) {
            if (excludeGroup && g === excludeGroup) continue;
            const m = tryFrom(g, roundIdx, false);
            if (m) return m;
        }
        return null;
    };

    for (let i = 0;  i < R; i++) {
        const want = perRound;
        const focusGroup = (opts.focusSeq[i] ?? null) as MechanicsGroup | null;
        const targetCat = opts.targetCategorySeq?.[i] ?? null;

        let first: Mechanic | null = null;
        const prevFirst = roundsOut[i - 1]?.[0] ?? null;
        const prevGroup = prevFirst?.group ?? null;

        if (focusGroup && focusGroup !== prevGroup) {
            first = tryFrom(
                focusGroup,
                i,
                opts.strictFocus === true,
                targetCat
            );
        }
        if (!first) first = pickAny(i, prevGroup);
        if (first) roundsOut[i].push(first);

        while (roundsOut[i].length < want) {
            let next: Mechanic | null = null;

            if (focusGroup) {
                next = tryFrom(
                    focusGroup,
                    i,
                    opts.strictFocus === true,
                    targetCat
                );
            }
            if (!next) {
                const last = roundsOut[i].at(-1);
                next = pickAny(i, last?.group ?? null);
            }
            if (!next) break;
            roundsOut[i].push(next);
        }
    }

    return roundsOut;
}