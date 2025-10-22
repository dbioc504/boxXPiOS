import { useEffect, useRef } from "react";
import { useAudioPlayer, setAudioModeAsync, } from "expo-audio";

const bellSrc = require("assets/sounds/roundBell.wav");
const clackSrc = require("assets/sounds/sticksClack.wav");

type PhaseLike = "getReady" | "round" | "rest" | "done";

export function useTimerSounds() {
    const bell = useAudioPlayer(bellSrc);
    const clack = useAudioPlayer(clackSrc);

    useEffect(() => {
        (async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                });
            } catch {

            }
        })();
    }, []);

    const playBell = () => {
        bell.seekTo(0);
        bell.play();
    };

    const playClack = () => {
        clack.seekTo(0);
        clack.play();
    };

    return { playBell, playClack };
}

export function useTenSecondClack(
    remainSec: number,
    phase: PhaseLike | null | undefined,
    roundIndex: number | null | undefined,
    playClack: () => void
) {
    const firedForRoundRef = useRef<number | null>(null);

    useEffect(() => {
        if (phase !== "round" || roundIndex == null) {
            firedForRoundRef.current = null;
            return;
        }

        if (remainSec === 10 && firedForRoundRef.current !== roundIndex) {
            firedForRoundRef.current = roundIndex;
            playClack();
        }
    }, [phase, roundIndex, remainSec, playClack]);
}