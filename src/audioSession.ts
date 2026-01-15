import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

const bellSrc = require("../assets/sounds/roundBell.wav");
const clackSrc = require("../assets/sounds/sticksClack.wav");
const silenceSrc = require("../assets/sounds/silence.mp3");

type EngineState = "idle" | "initializing" |  "ready" | "running" | "released";

async function prime(p: AudioPlayer) {
    try {
        p.play();
        p.pause();
        await p.seekTo(0);
    } catch {}
}

async function safeReplay(p: AudioPlayer) {
    try {
        p.pause();
    } catch {}
    try {
        await p.seekTo(0);
    } catch {}
    try {
        p.play();
    } catch {}
}

class AudioSessionEngine {
    private state: EngineState = "idle";
    private initPromise: Promise<void> | null = null;

    private keepAlive: AudioPlayer | null = null;
    private bell: AudioPlayer | null = null;
    private clack: AudioPlayer | null = null;

    async init() {
        if (this.state === "ready" || this.state === "running") return;
        if (this.state === "initializing" && this.initPromise) return this.initPromise;

        this.state = "initializing";

        this.initPromise = (async () => {
            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: true,
                interruptionMode: "mixWithOthers",
                allowsRecording: false,
            });

            this.keepAlive = createAudioPlayer(silenceSrc);
            this.keepAlive.loop = true;
            this.keepAlive.volume = 0.0001;

            this.bell = createAudioPlayer(bellSrc);
            this.clack = createAudioPlayer(clackSrc);

            this.bell.volume = 1;
            this.clack.volume = 1;

            // Prime once so currentTime seeking and replays behave more consistently
            await prime(this.bell);
            await prime(this.clack);
            await prime(this.keepAlive);

            this.state = "ready";
        })();

        return this.initPromise;
    }

    async startKeepAlive() {
        await this.init();
        if (!this.keepAlive) return;

        this.keepAlive.play();
        this.state = "running";
    }

    stopKeepAlive() {
        if (!this.keepAlive) return;

        this.keepAlive.pause();
        try { this.keepAlive.currentTime = 0; } catch {}
        if (this.state === "running") this.state = "ready";
    }

    playBell() {
        if (!this.bell) return;
        void safeReplay(this.bell);
    }

    playClack() {
        if (!this.clack) return;
        void safeReplay(this.clack);
    }

    release() {
        this.stopKeepAlive();
        this.keepAlive?.release();
        this.bell?.release();
        this.clack?.release();
        this.keepAlive = null;
        this.bell = null;
        this.clack = null;
        this.state = "released";
    }
}

export const audioSession = new AudioSessionEngine();
