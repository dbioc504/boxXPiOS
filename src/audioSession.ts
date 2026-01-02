import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

const bellSrc = require("../assets/sounds/roundBell.wav");
const clackSrc = require("../assets/sounds/sticksClack.wav");
const silenceSrc = require("../assets/sounds/silence.mp3");

type EngineState = "idle" | "ready" | "running" | "released";

class AudioSessionEngine {
    private state: EngineState = "idle";

    private keepAlive: AudioPlayer | null = null;
    private bell: AudioPlayer | null = null;
    private clack: AudioPlayer | null = null;

    async init() {
        if (this.state !== "idle") return;

        await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: "duckOthers",
            allowsRecording: false
        });

        this.keepAlive = createAudioPlayer(silenceSrc);
        this.keepAlive.loop = true;
        this.keepAlive.volume = 0.0001;

        this.bell = createAudioPlayer(bellSrc);
        this.clack = createAudioPlayer(clackSrc);
        this.bell.volume = 1;
        this.clack.volume = 1;

        this.state = "ready";
    }

    async startKeepAlive() {
        if (this.state === "idle") await this.init();
        if (!this.keepAlive) return;

        this.keepAlive.play();
        this.state = "running";
    }

    stopKeepAlive() {
        if(!this.keepAlive) return;

        this.keepAlive.pause();
        try { this.keepAlive.currentTime = 0; } catch {}
        if (this.state === "running") this.state = "ready";
    }

    playBell() {
        if (!this.bell) return;
        try { this.bell.currentTime = 0; } catch {}
        this.bell.play();
    }

    playClack() {
        if (!this.clack) return;
        try { this.clack.currentTime = 0; } catch {}
        this.clack.play();
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