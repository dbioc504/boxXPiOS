export type TimerConfig = {
    rounds: number;
    roundSec: number;
    restSec: number;
    warmupSec: number;
    showSkills: boolean;
    showCombos: boolean;
    showMechanics: boolean;
    skillMode: "balanced" | "specialized";
};

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
    rounds: 10,
    roundSec: 4 * 60,
    restSec: 30,
    warmupSec: 15,
    showSkills: false,
    showCombos: false,
    showMechanics: false,
    skillMode: "balanced",
};

export const TIMER_STORE_KEY = "timerConfig:v1";