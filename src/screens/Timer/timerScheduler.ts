import {PhaseState} from "@/screens/Timer/cues";
import {Timeline} from "@/screens/Timer/timeline";

export type TimerSchedulerCallbacks = {
    onTick?: (args: { now: number; ps: PhaseState; remainMs: number; remainSec: number; progress01: number }) => void;
    onPhaseChange?: (args: { now: number; prev: PhaseState | null; next: PhaseState }) => void;
    onDone?: (args: { now: number; ps: PhaseState }) => void;
};

export type TimerScheduler = {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;

    setTimeline: (timeline: Timeline | null) => void;
    getTimeline: () => Timeline | null;

    getIsRunning: () => boolean;

    attachAppState: () => () => void;
};