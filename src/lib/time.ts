export function fmtMMSS(totalSeconds: number, opts?: { padMinutes?: boolean }) {
    const m = Math.floor(Math.max(0, totalSeconds) / 60);
    const s = Math.max(0, totalSeconds) % 60;

    const minutes =  opts?.padMinutes ? String(m).padStart(2, "0") : String(m);
    const seconds = String(s).padStart(2, "0");
    return `${minutes}:${seconds}`;
}
