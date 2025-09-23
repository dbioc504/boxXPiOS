import { z } from 'zod';

const UUID_V7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const zUuidV7 = z
    .string()
    .regex(UUID_V7_REGEX, 'must be UUID v7');


export const zLocalId = z.string().startsWith('tmp_');
export const zAnyId = z.union([zUuidV7, zLocalId]);

/** enums */
export const zStyle = z.enum(['outboxer', 'boxer_puncher', 'infighter']);

export const zCategory = z.enum([
    // outboxer
    'long_range_boxing',
    'footwork',
    'defense',
    // boxer-puncher
    'counterpunching',
    'speed_and_power',
    'placement_timing',
    // infighter
    'pressure',
    'placement',
    'work_rate',

]);

export const zActivity = z.enum([
    'jumprope',
    'shadowboxing',
    'heavybag',
    'double_end_bag',
    'slip_bag',
    'slip_rope',
    'spar_bar',
    'mittwork',
    'sparring',
    'speed_bag',
]);

export const zPunch = z.enum([
    'jab',
    'straight',
    'left_hook',
    'right_hook',
    'left_uppercut',
    'right_uppercut',
    'overhand',
    'upjab',
]);

export const zBodyPunch = z.enum([
    'stab',
    'body_straight',
    'left_shovel_hook',
    'right_shovel_hook',
    'body_left_uppercut',
    'body_right_uppercut',
]);

export const zDefense = z.enum([
    'slip_right',
    'slip_left',
    'roll_right',
    'roll_left',
    'duck',
    'catch_left',
    'catch_right',
    'sit_left',
    'sit_right',
    'parry_left',
    'parry_right',
]);

export const zMovement = z.union([zPunch, zBodyPunch, zDefense]);

/** style to allowed categories */
export const STYLE_TO_CATEGORIES: Record<z.infer<typeof zStyle>, z.infer<typeof zCategory>[]> = {
    outboxer: ['long_range_boxing', 'footwork', 'defense'],
    boxer_puncher: ['counterpunching', 'speed_and_power', 'placement_timing'],
    infighter: ['pressure', 'placement', 'work_rate'],
};

/** cross field rule */
export const zCategoryForStyle = z
    .object({
        style: zStyle,
        category: zCategory,
    })
    .superRefine(({ style, category }, ctx) => {
        const allowed = new Set(STYLE_TO_CATEGORIES[style]);
        if (!allowed.has(category)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `category ${category} is not allowed for style ${style}`,
                path: ['category'],
            });
        }
    });

/** profile row */
export const zProfileRow = z.object({
    id: zUuidV7, // equals Supabase auth.users id if you migrate auth ids to v7
    displayName: z.string().optional(),
    style: zStyle,
    createdAt: z.string(), // ISO
});
export type ProfileRow = z.infer<typeof zProfileRow>;

/** catalog rows */
export const zTechniqueRow = z.object({
    id: zUuidV7,
    title: z.string().min(1),
    category: zCategory,
});
export type TechniqueRow = z.infer<typeof zTechniqueRow>;

export const zMechanicRow = z.object({
    id: zUuidV7,
    movement: zMovement,
    bullets: z.array(z.string().min(1)).min(1, 'at least one tip'),
});
export type MechanicRow = z.infer<typeof zMechanicRow>;

/** combos */
export const zComboTemplateRow = z.object({
    id: zUuidV7,
    name: z.string().min(1),
    category: zCategory,
    steps: z.array(zMovement).min(1, 'at least one move'),
});
export type ComboTemplateRow = z.infer<typeof zComboTemplateRow>;

export const zComboUserDraft = z.object({
    id: zAnyId,
    userId: zUuidV7,
    name: z.string().min(1),
    style: zStyle.optional(),
    steps: z.array(zMovement).min(1),
});
export const zComboUserRow = z.object({
    id: zUuidV7,
    userId: zUuidV7,
    name: z.string().min(1),
    style: zStyle.optional(),
    steps: z.array(zMovement).min(1),
});
export type ComboUserDraft = z.infer<typeof zComboUserDraft>;
export type ComboUserRow = z.infer<typeof zComboUserRow>;

/** workouts */
export const zWorkoutPlanDraft = z.object({
    id: zAnyId,
    userId: zUuidV7,
    name: z.string().min(1).optional(),
    style: zStyle.optional(),
});
export const zWorkoutPlanRow = z.object({
    id: zUuidV7,
    userId: zUuidV7,
    name: z.string().min(1).optional(),
    style: zStyle.optional(),
});
export type WorkoutPlanDraft = z.infer<typeof zWorkoutPlanDraft>;
export type WorkoutPlanRow = z.infer<typeof zWorkoutPlanRow>;

export const zWorkoutSegmentDraft = z.object({
    id: zAnyId,
    workoutId: zAnyId, // can be tmp during authoring
    activity: zActivity,
    roundCount: z.number().int().min(1).max(50),
    orderIndex: z.number().int().min(0),
});
export const zWorkoutSegmentRow = z.object({
    id: zUuidV7,
    workoutId: zUuidV7,
    activity: zActivity,
    roundCount: z.number().int().min(1).max(50),
    orderIndex: z.number().int().min(0),
});
export type WorkoutSegmentDraft = z.infer<typeof zWorkoutSegmentDraft>;
export type WorkoutSegmentRow = z.infer<typeof zWorkoutSegmentRow>;

export const zWorkoutRoundDraft = z.object({
    id: zAnyId,
    segmentId: zAnyId,
    roundNumber: z.number().int().min(1),
    roundDuration: z.number().int().min(30).max(240),
    restDuration: z.number().int().min(0).max(60),
    skillId: zAnyId.optional(),
    comboId: zAnyId.optional(),
    mechanicIds: z.array(zAnyId).max(2),
    notes: z.string().optional(),
});
export const zWorkoutRoundRow = z.object({
    id: zUuidV7,
    segmentId: zUuidV7,
    roundNumber: z.number().int().min(1),
    roundDuration: z.number().int().min(30).max(240),
    restDuration: z.number().int().min(0).max(60),
    skillId: zUuidV7.optional(),
    comboId: zUuidV7.optional(),
    mechanicIds: z.array(zUuidV7).max(2),
    notes: z.string().optional(),
});
export type WorkoutRoundDraft = z.infer<typeof zWorkoutRoundDraft>;
export type WorkoutRoundRow = z.infer<typeof zWorkoutRoundRow>;
