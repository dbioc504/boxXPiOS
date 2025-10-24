import {Category, Id, Movement} from './common';

export type MechanicGroup = 'stance' | 'footwork' | 'defense' | 'punches';

export const MECHANIC_GROUP_LABEL: Record<MechanicGroup, string> = {
    stance: 'Stance',
    footwork: 'Footwork',
    defense: 'Defense',
    punches: 'Punches'
}

export const MECHANIC_GROUPS: MechanicGroup[] = [
    'stance', 'footwork', 'defense', 'punches'
];

export interface MechanicBullet {
    id: Id;
    text: string;
}

export interface Mechanic {
    id: Id;
    group: MechanicGroup;
    movement?: Movement;
    bullets: MechanicBullet[];
    skillCategories?: Category[];
}

export type MechanicsCatalog = Record<MechanicGroup, Mechanic[]>