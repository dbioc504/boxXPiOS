import {
    zTechniqueRow, type TechniqueRow,
    zComboTemplateRow, type ComboTemplateRow,
    zMechanicRow, type MechanicRow
} from "@/types/validation";

function makeUuidV7(seed: number): string {
    const suffix = seed.toString(16).padStart(12,'0');
    return `018f26e0-a1b2-7c3d-8e9f-${suffix}`;
}

const rawTechniques = [
    {
        id: makeUuidV7(1),
        title: 'Use your footwork and flick your jab out with speed to measure how long you can keep ' +
            'your opponent at bay. Once comfortable and in your range while out of opponent\'s range,' +
            'shoot the straight down the pipe',
        category: 'long_range_boxing',
    },
    {
        id: makeUuidV7(2),
        title: 'Shuffle in circles around opponent away from power hand. Avoid corners and ropes. ',
        category: 'footwork'
    },
    {
        id: makeUuidV7(3),
        title: 'find a rhythm with smooth and small head movements in between exchanges and assaults',
        category: 'defense'
    },
] as const;

export const TECHNIQUES: TechniqueRow[] =
    rawTechniques.map((t) => zTechniqueRow.parse(t));

const rawCombos = [
    {
        id: makeUuidV7(10),
        name: 'tick tick boom',
        category: 'pressure',
        steps: ['jab', 'jab', 'straight'],
    },
    {
        id: makeUuidV7(11),
        name: 'rocking chair',
        category: 'pressure',
        steps: ['slip_left', 'upjab', 'straight', 'upjab', 'straight'],
    },
    {
        id: makeUuidV7(12),
        name: 'rope trap',
        category: 'work_rate',
        steps: ['stab', 'right_shovel_hook', 'left_shovel_hook', 'right_hook', 'left_hook','roll_right',
        'straight', 'left_hook', 'straight', 'roll_right']
    }
] as const;

export const COMBOS: ComboTemplateRow[] =
    rawCombos.map((t) => zComboTemplateRow.parse(t));

const rawMechanics = [
    {
        id: makeUuidV7(20),
        movement: 'jab',
        bullets: ['Keep rear hand tight', 'turn over knuckles'],
    },
    {
        id: makeUuidV7(21),
        movement: 'slip_left',
        bullets: ['turn right hip', 'eyes up', 'hands at temples'],
    }
] as const;

export const MECHANICS: MechanicRow[] =
    rawMechanics.map((t) => zMechanicRow.parse(t));

export { makeUuidV7 };