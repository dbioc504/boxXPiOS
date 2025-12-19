import type { PhaseState } from "@/screens/Timer/cues";
import type { TimerCfg } from "@/screens/Timer/cues";
import { remainingMs, nextPhase } from "@/screens/Timer/cues";

export type Timeline =  {
    anchorMs: number;
    ps: PhaseState;
    cfg: TimerCfg;
};

export function derivePhaseAtTime(
    timeline: Timeline,
    now: number
): PhaseState {
    let cur = { ...timeline.ps };

    while (cur.phase !== "done") {
        const rem = remainingMs(cur, now);
        if (rem > 0) return cur;

        const next = nextPhase(cur, timeline.cfg);
        cur = {
            ...next,
            phaseStartAtMs: cur.phaseStartAtMs + cur.phaseDurationMs,
        };
    }

    return cur;
}

export function advanceTimeline(
    timeline: Timeline,
    now: number
): PhaseState {
    return derivePhaseAtTime(timeline, now);
}