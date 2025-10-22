import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { computeUpcomingCues, remainingMs, type PhaseState, type TimerCfg } from './cues';


type Sounds = { bell: string, clack: string };

const MAX_TO_SCHEDULE = 50;

function toTrigger(atMs: number): Notifications.NotificationTriggerInput {
    const delta = atMs - Date.now();
    if (delta <= 250) {
        return {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(Date.now() + 1000), // safer fallback
        };
    }
    return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(atMs),
    };
}

export function useBackgroundCues(
    ps: PhaseState | null,
    cfg: TimerCfg | null,
    sounds: Sounds,
    isRunning?: boolean // <— pass this in
) {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const sub = AppState.addEventListener('change', async (next) => {
            const wasActive = appState.current === "active";
            const goingBg = wasActive && (next === "background" || next === "inactive");
            const comingFg = (appState.current === "background" || appState.current === "inactive") && next === "active";

            if (goingBg && ps && cfg && isRunning) {
                // fresh slate
                await Notifications.cancelAllScheduledNotificationsAsync();

                const now = Date.now();
                if (remainingMs(ps, now) > 0) {
                    const all = computeUpcomingCues(ps, cfg, now);
                    const toSchedule = all.slice(0, MAX_TO_SCHEDULE);

                    // (optional) debug: console.log('scheduling', toSchedule.length, 'cues');

                    for (const cue of toSchedule) {
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
    }, [ps, cfg, sounds, isRunning]);
}