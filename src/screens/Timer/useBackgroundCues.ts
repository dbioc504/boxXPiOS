import * as Notifications from 'expo-notifications';
import {AppState} from 'react-native';
import {useEffect, useRef} from 'react';
import {computeUpcomingCues, type PhaseState, remainingMs, type TimerCfg} from './cues';


type Sounds = { bell: string, clack: string };

const MAX_TO_SCHEDULE = 50;

function toTrigger(atMs: number): Notifications.NotificationTriggerInput {
    let fireAt = Math.ceil(atMs / 1000) * 1000;

    // If we're too close (≤ 1s), push by 1s to avoid flakiness
    if (fireAt - Date.now() <= 1000) {
        fireAt = Date.now() + 1000;
    }

    return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(fireAt),
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
                await Notifications.cancelAllScheduledNotificationsAsync();

                const now = Date.now();
                const FUTURE_PAD_MS = 1200;
                if (remainingMs(ps, now) > 0) {
                    const all = computeUpcomingCues(ps, cfg, now);
                    const future = all.filter(c => c.at - now > FUTURE_PAD_MS);
                    const toSchedule = future.slice(0, MAX_TO_SCHEDULE);

                    // 👇 ADD THIS — see how many iOS already has
                    const before = await Notifications.getAllScheduledNotificationsAsync();
                    console.log('scheduled BEFORE:', before.length);

                    for (const cue of toSchedule) {
                        const isBell = cue.kind === 'bell';
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: isBell ? 'Round change' : 'Ten seconds left',
                                body: isBell ? 'Bell' : 'Clack',
                                sound: isBell ? sounds.bell : sounds.clack ,
                                interruptionLevel: 'timeSensitive' as const,
                            },
                            trigger: toTrigger(cue.at),
                        });
                    }

                    // 👇 ADD THIS — verify they were accepted
                    const after = await Notifications.getAllScheduledNotificationsAsync();
                    console.log('scheduled AFTER:', after.length);
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