export type Phase = "getReady" | "round" | "rest" | "done";

export type PhaseState = {
    phase: Phase;
    roundIndex: number;
    phaseDurationMs: number;
    phaseStartAtMs: number;
};

export type TimerCfg = {
    rounds: number;
    roundSec: number;
    restSec: number;
    warmupSec: number;
};

export function remainingMs(ps: PhaseState, now: number) {
    return ps.phaseDurationMs - (now - ps.phaseStartAtMs);
}

export function makePhase(phase: Phase, roundIndex: number, cfg: TimerCfg): PhaseState {
    const now = Date.now();
    const durMs =
        phase === "getReady" ? cfg.warmupSec * 1000 :
            phase === "round"    ? cfg.roundSec * 1000  :
                phase === "rest"     ? cfg.restSec * 1000   : 0;
    return { phase, roundIndex, phaseDurationMs: durMs, phaseStartAtMs: now };
}

export function nextPhase(ps: PhaseState, cfg: TimerCfg): PhaseState {
    switch (ps.phase) {
        case "getReady": return makePhase("round", 0, cfg);
        case "round": {
            const isLast = ps.roundIndex >= cfg.rounds - 1;
            if (isLast) return makePhase("done", ps.roundIndex, cfg);
            if (cfg.restSec <= 0) return makePhase("round", ps.roundIndex + 1, cfg);
            return makePhase("rest", ps.roundIndex, cfg);
        }
        case "rest": return makePhase("round", ps.roundIndex + 1, cfg);
        default: return makePhase("done", ps.roundIndex, cfg);
    }
}

type Cue = { at: number; kind: "bell" | "clack" };

export function computeUpcomingCues(ps: PhaseState, cfg: TimerCfg, now: number, limit = 8): Cue[] {
    const cues: Cue[] = [];
    let cur: PhaseState = { ...ps };
    let tCursor = now;

    const rem0 = remainingMs(cur, tCursor);
    cur.phaseStartAtMs = tCursor - (cur.phaseDurationMs - rem0);

    while (cues.length < limit && cur.phase !== "done") {
        const rem = remainingMs(cur, tCursor);
        const phaseEndAt = tCursor + rem;

        if (cur.phase === "round" && rem > 10_000) {
            cues.push({ at: phaseEndAt - 10_000, kind: "clack" });
        }
        cues.push({ at: phaseEndAt, kind: "bell" });

        const next = nextPhase(
            { ...cur, phaseStartAtMs: cur.phaseStartAtMs + cur.phaseDurationMs },
            cfg
        );
        next.phaseStartAtMs = phaseEndAt;
        cur = next;
        tCursor = phaseEndAt;
    }
    return cues;
}