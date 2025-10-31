// src/types/mechanic.ts
import {Category, Id, Movement} from '@/types/common';

export type MechanicsGroup = 'stance' | 'footwork' | 'defense' | 'punches';
export const MECHANICS_GROUP: MechanicsGroup[] = [
    'stance', 'footwork', 'defense', 'punches'
];

export type MechanicBullet = { id: Id; text: string };

export const MECHANICS_GROUP_LABEL: Record<MechanicsGroup, string> = {
    stance: 'Stance',
    footwork: 'Footwork',
    defense: 'Defense',
    punches: 'Punches',
};


export type MechanicBase = {
    id: Id;
    group: MechanicsGroup;
    bullets: MechanicBullet[];
};

export type MechanicTitleItem = MechanicBase & {
    kind: 'title';
    movements?: Movement[]
    title: string;
    category?: Category[];
};

export type MechanicMovementItem = MechanicBase & {
    kind: 'movement';
    movements?: Movement[];
    movement?: Movement;
    category?: Category[];
};

export type Mechanic = MechanicTitleItem | MechanicMovementItem;

export type MechanicsCatalog = {
    version: number;
    items: Mechanic[];
};

export function getMechanicTitle(
    item: Mechanic,
    MOVEMENT_LABEL: Record<Movement, string>
): string {
    if (item.kind === 'title') return item.title;

    const anyTitle = (item as any).title as string | undefined;
    if (anyTitle && anyTitle.trim().length) return anyTitle.trim();

    if (item.kind === 'movement') {
        if (item.movements?.length) {
            const parts = item.movements.map((m) => MOVEMENT_LABEL[m] ?? String(m));
            return parts.join(' / ');
        }
        if (item.movement) {
            return MOVEMENT_LABEL[item.movement] ?? String(item.movement);
        }
    }

    return String(item.id);
}
