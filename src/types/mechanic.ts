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
    title: string;
};

export type MechanicMovementItem = MechanicBase & {
    kind: 'movement';
    movement: Movement;
    category?: Category[]; // or Category[] if you want strong typing now
};

export type Mechanic = MechanicTitleItem | MechanicMovementItem;

export type MechanicsCatalog = {
    version: number;
    items: Mechanic[];
};
