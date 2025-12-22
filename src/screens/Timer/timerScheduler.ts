import {PhaseState, remainingMs} from "@/screens/Timer/cues";
import {derivePhaseAtTime, Timeline} from "@/screens/Timer/timeline";
import {AppState, AppStateStatus} from "react-native";

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

export function createTimerScheduler(params: {
    tickMs: number;
    callbacks?: TimerSchedulerCallbacks;
}): TimerScheduler {
    const tickMs = params.tickMs ?? 80;
    const cb = params.callbacks ?? {};

    let timeline: Timeline | null = null;
    let isRunning = false;

    let tickHandle: ReturnType<typeof setTimeout> | null = null;

    let prevPs: PhaseState | null = null;

    const appStateRef: { current: AppStateStatus } = { current: AppState.currentState };

    function clearTick() {
        if (tickHandle) clearTimeout(tickHandle);
        tickHandle = null;
    }

    function getTimeline() {
        return timeline;
    }

    function setTimeline(next: Timeline | null) {
        timeline = next;
        prevPs = null;
    }

    function getIsRunning() {
        return isRunning;
    }

    function tickOnce() {
        if (!isRunning) return;
        if (!timeline) return;

        const now = Date.now();
        const ps = derivePhaseAtTime(timeline, now);

        const phaseChanged =
            !prevPs || prevPs.phase !== ps.phase || prevPs.roundIndex !== ps.roundIndex;

        if (phaseChanged) {
            cb.onPhaseChange?.({ now, prev: prevPs, next: ps });
            prevPs = ps;
        } else {
            prevPs = ps;
        }

        const rem = Math.max(0, remainingMs(ps, now));
        const remainSec = Math.ceil(rem / 1000);
        const progress01 = ps.phaseDurationMs > 0 ? 1 - rem / ps.phaseDurationMs : 0;

        cb.onTick?.({ now, ps, remainMs: rem, remainSec, progress01 });

        if (ps.phase === "done") {
            isRunning = false;
            clearTick();
            cb.onDone?.({ now, ps });
            return;
        }

        tickHandle = setTimeout(tickOnce, tickMs);
    }

    function start() {
        if (isRunning) return;
        if (!timeline) return;

        isRunning = true;
        clearTick();
        tickOnce();
    }

    function stop() {
        isRunning = false;
        clearTick();
    }

    function pause() {
        if (!isRunning) return;
        if (!timeline) return;

        const now = Date.now();
        const cur = derivePhaseAtTime(timeline, now);
        const rem = Math.max(0, remainingMs(cur, now));

        timeline = {
            anchorMs: now,
            ps: {
                ...cur,
                phaseDurationMs: rem,
                phaseStartAtMs: now,
            },
            cfg: timeline.cfg
        };

        isRunning = false;
        clearTick();
    }

    function resume() {
        if (isRunning) return;
        if (!timeline) return;

        const now = Date.now();

        timeline = {
            ...timeline,
            anchorMs: now,
            ps: {
                ...timeline.ps,
                phaseStartAtMs: now
            }
        };

        isRunning = true;
        clearTick();
        tickOnce();
    }

    function attachAppState() {
        const sub = AppState.addEventListener("change", (nextState) => {
            const prev = appStateRef.current;
            appStateRef.current = nextState;

            const wentToBg = prev === "active" && (nextState === "inactive" || nextState === "background");
            const cameToFg = (prev === "inactive" || prev === "background") && nextState === "active";

            if (wentToBg) {
                clearTick();
            }

            if (cameToFg) {
                if (isRunning && timeline) {
                    clearTick();
                    tickOnce();
                }
            }
        });

        return () => sub.remove();
    }

    return {
        start,
        pause,
        resume,
        stop,

        setTimeline,
        getTimeline,

        getIsRunning,

        attachAppState
    };
}