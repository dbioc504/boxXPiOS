export type Style = 'outboxer' | 'boxer_puncher' | 'infighter'

export const STYLE_LABEL: Record<Style, string> = {
    outboxer: 'Outboxer',
    boxer_puncher: 'Boxer-Puncher',
    infighter: 'Infighter'
}

export type Category =
    | 'mid_long_range'
    | 'counterpunching'
    | 'angles_footwork'
    | 'pressure'
    | 'infighting';

export const CATEGORY_LABEL: Record<Category, string> = {
    mid_long_range: 'Mid/Long Range',
    counterpunching: 'Counterpunching',
    angles_footwork: 'Angles/Footwork',
    pressure: 'Pressure',
    infighting: 'Infighting'
}

export type Activity =
    | 'jumprope'
    | 'shadowboxing'
    | 'heavybag'
    | 'double_end_bag'
    | 'slip_bag'
    | 'slip_rope'
    | 'spar_bar'
    | 'mittwork'
    | 'sparring'
    | 'speed_bag';

export const ACTIVITY_LABEL: Record<Activity, string> = {
    jumprope: 'Jump Rope',
    shadowboxing: 'Shadowboxing',
    heavybag: 'Heavy Bag',
    double_end_bag: 'Double End Bag',
    slip_bag: 'Slip Bag',
    slip_rope: 'Slip Rope',
    spar_bar: 'Spar Bar',
    mittwork: 'Mittwork',
    sparring: 'Sparring',
    speed_bag: 'Speed Bag'
}

// Canonical order arrays for iteration/use
export const STYLES: Style[] = ['outboxer', 'boxer_puncher', 'infighter']
export const CATEGORIES: Category[] = [
    'mid_long_range',
    'counterpunching',
    'angles_footwork',
    'pressure',
    'infighting'
]
export const ACTIVITIES: Activity[] = [
    'jumprope',
    'shadowboxing',
    'heavybag',
    'double_end_bag',
    'slip_bag',
    'slip_rope',
    'spar_bar',
    'mittwork',
    'sparring',
    'speed_bag'
]

// ... existing code ...
export type Punch =
    | 'jab'
    | 'straight'
    | 'left_hook'
    | 'right_hook'
    | 'left_uppercut'
    | 'right_uppercut'
    | 'overhand'
    | 'upjab';

export type BodyPunch =
    | 'stab'
    | 'body_straight'
    | 'left_shovel_hook'
    | 'right_shovel_hook'
    | 'body_left_uppercut'
    | 'body_right_uppercut';

export type Defense =
    | 'slip_right'
    | 'slip_left'
    | 'roll_right'
    | 'roll_left'
    | 'duck'
    | 'catch_left'
    | 'catch_right'
    | 'sit_left'
    | 'sit_right'
    | 'parry_left'
    | 'parry_right';

export type Movement = Punch | BodyPunch | Defense

export type Id = string;
// ... existing code ...

// Canonical label maps for combat tokens
export const PUNCH_LABEL: Record<Punch, string> = {
    jab: 'Jab',
    straight: 'Straight',
    left_hook: 'Left Hook',
    right_hook: 'Right Hook',
    left_uppercut: 'Left Uppercut',
    right_uppercut: 'Right Uppercut',
    overhand: 'Overhand',
    upjab: 'Up Jab'
}

export const BODY_PUNCH_LABEL: Record<BodyPunch, string> = {
    stab: 'Stab',
    body_straight: 'Body Straight',
    left_shovel_hook: 'Left Shovel Hook',
    right_shovel_hook: 'Right Shovel Hook',
    body_left_uppercut: 'Body Left Uppercut',
    body_right_uppercut: 'Body Right Uppercut'
}

export const DEFENSE_LABEL: Record<Defense, string> = {
    slip_right: 'Slip Right',
    slip_left: 'Slip Left',
    roll_right: 'Roll Right',
    roll_left: 'Roll Left',
    duck: 'Duck',
    catch_left: 'Catch Left',
    catch_right: 'Catch Right',
    sit_left: 'Sit Left',
    sit_right: 'Sit Right',
    parry_left: 'Parry Left',
    parry_right: 'Parry Right'
}

// Canonical order arrays for combat tokens
export const PUNCHES: Punch[] = [
    'jab',
    'straight',
    'left_hook',
    'right_hook',
    'left_uppercut',
    'right_uppercut',
    'overhand',
    'upjab'
]

export const BODY_PUNCHES: BodyPunch[] = [
    'stab',
    'body_straight',
    'left_shovel_hook',
    'right_shovel_hook',
    'body_left_uppercut',
    'body_right_uppercut'
]

export const DEFENSES: Defense[] = [
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
    'parry_right'
]

export const MOVEMENTS: Movement[] = [
    ...PUNCHES,
    ...BODY_PUNCHES,
    ...DEFENSES
]

export const MOVEMENT_LABEL: Record<Movement, string> = {
    ...PUNCH_LABEL,
    ...BODY_PUNCH_LABEL,
    ...DEFENSE_LABEL
}