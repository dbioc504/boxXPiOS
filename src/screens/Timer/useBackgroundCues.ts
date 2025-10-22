import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { computeUpcomingCues, remainingMs, type PhaseState, type TimerCfg } from './cues';

type Sounds = { bell: string, clack: string };


function toTrigger(atMs: number): Notifications.NotificationTriggerInput {
    const delta = atMs - Date.now();

    // If the target time is already in the past (or ~now), fire “soon”
    if (delta <= 250) {
        return {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            repeats: false,
        };
    }

    // Otherwise schedule for an absolute date/time
    return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(atMs),
    };
}

export function useBackgroundCues(ps: PhaseState | null, cfg: TimerCfg | null, sounds: Sounds) {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const sub = AppState.addEventListener('change', async (next) => {
            const wasActive = appState.current === "active";
            const goingBg = wasActive && (next === "background" || next === "inactive");
            const comingFg = (appState.current === "background" || appState.current === "inactive") && next === "active";

            if (goingBg && ps && cfg) {
                await Notifications.cancelAllScheduledNotificationsAsync();

                const now = Date.now();
                const rem = remainingMs(ps, now);
                if (rem > 0) {
                    const cues = computeUpcomingCues(ps, cfg, now, 8);
                    for (const cue of cues) {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                sound: cue.kind === 'bell' ? sounds.bell : sounds.clack,
                                interruptionLevel: 'timeSensitive' as const,
                            },
                            trigger: toTrigger(cue.at),
                        });
                    }
                }
            }

            if (comingFg) {
                await Notifications.cancelAllScheduledNotificationsAsync();
            }

            appState.current = next;
        });

        return () => { sub.remove(); Notifications.cancelAllScheduledNotificationsAsync(); };
    }, [ps, cfg, sounds]);
}