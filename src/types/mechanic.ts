import { Id, Movement } from './common';

export interface Mechanic {
    id: Id;
    movement: Movement;
    bullets: string[];
}