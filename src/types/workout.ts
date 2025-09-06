import { Id, Activity, Style } from './common';

export interface WorkoutPlan {
    id: Id;
    userId: Id;
    name?: string;
    style?: Style;
}

export interface WorkoutSegment {
    id: Id;
    workoutId: Id;
    activity: Activity;
    roundCount: number;
    orderIndex: number;
}

export interface WorkoutRound {
    id: Id;
    segmentId: Id;
    roundNumber: number;
    roundDuration: number;
    restDuration: number;
    skillId?: Id;
    comboId?: Id;
    mechanicIds: Id[];
    notes?: string;
}