import {
    zComboUserDraft, zComboUserRow,
    zMechanicRow, zWorkoutRoundRow,
    zCategoryForStyle, zUuidV7, zLocalId
} from '@/types/validation';


const V7_A = '018f26e0-a1b2-7c3d-8e9f-a1b2c3d4e5f6';
const V7_B = '018f26e1-a1b2-7c3d-9e9f-a1b2c3d4e5f7';
const V7_C = '018f26e2-a1b2-7c3d-ae9f-a1b2c3d4e5f8';
const V7_D = '018f26e3-a1b2-7c3d-be9f-a1b2c3d4e5f9';

const V4_EX = '550e8400-e29b-41d4-a716-446655440000';

describe('Validation Schemas', () => {
    test('Draft accepts tmp id, Row requires v7', () => {
        const draft = { id: 'tmp_1', userId: V7_A, name: 'test', steps: ['jab'] };
        const row   = { id: V7_B, userId: V7_C, name: 'test', steps: ['jab'] };

        expect(() => zComboUserDraft.parse(draft)).not.toThrow();
        expect(() => zComboUserRow.parse(row)).not.toThrow();

        // Row should not accept a tmp_ id
        expect(() => zComboUserRow.parse({ ...row, id: 'tmp_bad' })).toThrow();
    });

    test('Mechanic requires at least one bullet', () => {
        const good = { id: V7_A, movement: 'jab', bullets: ['keep guard up'] };
        const bad  = { id: V7_B, movement: 'jab', bullets: [] };

        expect(() => zMechanicRow.parse(good)).not.toThrow();
        expect(() => zMechanicRow.parse(bad)).toThrow();
    });

    test('Combo must have at least one step', () => {
        const good = { id: V7_A, userId: V7_B, name: 'good', steps: ['left_hook'] };
        const bad  = { id: V7_C, userId: V7_D, name: 'bad', steps: [] };

        expect(() => zComboUserRow.parse(good)).not.toThrow();
        expect(() => zComboUserRow.parse(bad)).toThrow();
    });

    test('Workout round allows at most two mechanics', () => {
        const base = {
            id: V7_A,
            segmentId: V7_B,
            roundNumber: 1,
            roundDuration: 180,
            restDuration: 60,
            mechanicIds: [] as string[],
        };

        expect(() =>
            zWorkoutRoundRow.parse({ ...base, mechanicIds: [V7_C, V7_D] })
        ).not.toThrow();

        expect(() =>
            zWorkoutRoundRow.parse({ ...base, mechanicIds: [V7_A, V7_B, V7_C] })
        ).toThrow();
    });

    test('Category must match style', () => {
        const valid   = { style: 'outboxer', category: 'angles_footwork' };
        const invalid = { style: 'outboxer', category: 'pressure' };

        expect(() => zCategoryForStyle.parse(valid)).not.toThrow();
        expect(() => zCategoryForStyle.parse(invalid)).toThrow();
    });

    test('UUID v7 passes, v4 fails', () => {
        expect(() => zUuidV7.parse(V7_A)).not.toThrow();
        expect(() => zUuidV7.parse(V4_EX)).toThrow();
    });

    test('Local id passes tmp_ rule', () => {
        expect(() => zLocalId.parse('tmp_abc')).not.toThrow();
        expect(() => zLocalId.parse('abc')).toThrow();
    });
});
