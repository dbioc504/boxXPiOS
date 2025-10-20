// src/screens/Timer/TimerRunScreen.tsx
import React, {useEffect, useRef, useState, useMemo} from "react";
import {AppState, AppStateStatus, Pressable, StyleSheet, View, FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {BodyText, Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {fmtMMSS} from "@/lib/time";
import {DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig} from "@/types/timer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useKeepAwake} from "expo-keep-awake";
import { SKILL_PLAN_STORE_KEY, type SkillPlanSaved } from "@/types/skillPlan";
import { CATEGORY_LABEL, type Category } from "@/types/common";

type Phase = "getReady" | "round" | "rest" | "done";

type PhaseState = {
    phase: Phase;
    roundIndex: number;
    phaseDurationMs: number;
    phaseStartAtMs: number;
};

const TICK_MS = 80;

export default function TimerRunScreen() {
    useKeepAwake();
    const [cfg, setCfg] = useState<TimerConfig | null>(null);
    const [plan, setPlan] = useState<SkillPlanSaved | null>(null);

    const [ps, setPs] = useState<PhaseState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [now, setNowMs] = useState(() => Date.now());

    const tickRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const bgAt = useRef<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(TIMER_STORE_KEY);
                const loaded = raw ? { ...DEFAULT_TIMER_CONFIG, ...JSON.parse(raw) } : DEFAULT_TIMER_CONFIG;
                loaded.rounds = Math.max(1, loaded.rounds);
                loaded.roundSec = Math.max(1, loaded.roundSec);
                loaded.restSec = Math.max(0, loaded.restSec);
                loaded.warmupSec = Math.max(0, loaded.warmupSec);
                setCfg(loaded);
            } catch {
                setCfg(DEFAULT_TIMER_CONFIG);
            }
        })();

        (async () => {
            try {
                const raw = await AsyncStorage.getItem(SKILL_PLAN_STORE_KEY);
                if (raw) setPlan(JSON.parse(raw));
            } catch { setPlan(null); }
        })();
    }, []);

    useEffect(() => {
        if (!cfg) return;
        const first = makePhase(cfg.warmupSec > 0 ? "getReady" : "round", 0, cfg);
        setPs(first);
        setIsRunning(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [cfg]);

    useEffect(() => {
        const sub = AppState.addEventListener("change", (next) => {
            if (appState.current.match(/active/) && next.match(/inactive|background/)) {
                bgAt.current = Date.now();
            }
            if (appState.current.match(/inactive|background/) && next === "active") {
                if (bgAt.current && ps && isRunning) {
                    const away = Date.now() - bgAt.current;
                    setPs((cur) => (cur ? { ...cur, phaseStartAtMs: cur.phaseStartAtMs - away } : cur));
                }
                bgAt.current = null;
            }
            appState.current = next;
        });
        return () => sub.remove();
    }, [ps, isRunning]);

    useEffect(() => {
        if (!ps || !cfg) return;

        const loop = () => {
            if (!isRunning) return;
            tickRef.current = setTimeout(() => {
                const t = Date.now();
                setNowMs(t);

                const rem = remainingMs(ps, t);
                if (rem <= 0) {
                    const next = nextPhase(ps, cfg);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setPs(next);
                    if (next.phase === "done") {
                        setIsRunning(false);
                        return;
                    }
                }
                loop();
            }, TICK_MS);
        };

        loop();
        return () => tickRef.current && clearTimeout(tickRef.current);
    }, [ps, isRunning, cfg]);

    const remain = ps ? Math.max(0, remainingMs(ps, now)) : 0;
    const remainSec = Math.ceil(remain / 1000);
    const progress = ps ? 1 - remain / ps.phaseDurationMs : 0;

    const phaseLabel =
        ps?.phase === "getReady" ? "GET READY" :
            ps?.phase === "round" ? `ROUND ${ps.roundIndex + 1} / ${cfg?.rounds ?? 1}` :
                ps?.phase === "rest" ? "REST" : "DONE";

    const color =
        ps?.phase === "getReady" || ps?.phase === "rest" ? colors.timerRed :
            ps?.phase === "round" ? colors.timerStart : colors.background;

    const roundTechs = useMemo(() => {
        if (!plan || !cfg || !ps || !cfg.showSkills) return [];
        if (plan.rounds !== cfg.rounds) return [];
        if (ps.phase !== "round") return [];
        const rp = plan.plans.find((p) => p.roundIndex === ps.roundIndex);
        return rp?.techniques ?? [];
    }, [plan, cfg, ps]);

    return (
        <SafeAreaView style={[sharedStyle.safeArea, styles.screen, { backgroundColor: color }]}>
            <Header title=""/>

            <View style={styles.center}>
                <BodyText style={[styles.phase, { color: colors.offWhite }]}>{phaseLabel}</BodyText>
                <BodyText style={styles.time}>{fmtMMSS(remainSec)}</BodyText>

                <View style={styles.progressWrap}>
                    <View style={[
                        styles.progressBar,
                        { width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }
                    ]}/>
                </View>

                {!!roundTechs.length && (
                    <View style={styles.skillsWrap}>
                        <BodyText style={styles.skillsTitle}>Skills</BodyText>
                        <FlatList
                            data={roundTechs}
                            keyExtractor={(t) => t.id}
                            renderItem={({ item }) => (
                                <View style={styles.skillRow}>
                                    <BodyText style={styles.skillName}>{item.title}</BodyText>
                                    <BodyText style={styles.skillCat}>{CATEGORY_LABEL[item.category as Category]}</BodyText>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            style={{ alignSelf: "stretch" }}
                        />
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <PrimaryBtn label={isRunning ? "Pause" : "Resume"} onPress={() => setIsRunning((r) => !r)} />
            </View>
        </SafeAreaView>
    );
}

// helpers
function makePhase(phase: Phase, roundIndex: number, cfg: TimerConfig): PhaseState {
    const now = Date.now();
    const durMs =
        phase === "getReady" ? cfg.warmupSec * 1000 :
            phase === "round" ? cfg.roundSec * 1000 :
                phase === "rest" ? cfg.restSec * 1000 : 0;
    return { phase, roundIndex, phaseDurationMs: durMs, phaseStartAtMs: now };
}

function nextPhase(ps: PhaseState, cfg: TimerConfig): PhaseState {
    switch (ps.phase) {
        case "getReady":
            return makePhase("round", 0, cfg);
        case "round": {
            const isLast = ps.roundIndex >= cfg.rounds - 1;
            if (isLast) return makePhase("done", ps.roundIndex, cfg);
            if (cfg.restSec <= 0) return makePhase("round", ps.roundIndex + 1, cfg);
            return makePhase("rest", ps.roundIndex, cfg);
        }
        case "rest":
            return makePhase("round", ps.roundIndex + 1, cfg);
        case "done":
        default:
            return makePhase("done", ps.roundIndex, cfg);
    }
}

function remainingMs(ps: PhaseState, now: number) {
    return ps.phaseDurationMs - (now - ps.phaseStartAtMs);
}

function PrimaryBtn({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}>
            <BodyText style={styles.primaryBtnText}>{label}</BodyText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, alignItems: "center", paddingHorizontal: 16, gap: 3, alignSelf: "stretch" },
    phase: { fontSize: 30, fontWeight: "800", letterSpacing: 0.5 },
    time: { fontSize: 80, fontWeight: "800", color: colors.offWhite },
    progressWrap: {
        width: "90%",
        height: 10,
        borderRadius: 999,
        backgroundColor: colors.offWhite,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.offWhite,
        marginTop: 6,
        alignSelf: "center",
    },
    progressBar: { height: "100%" },
    skillsWrap: {
        alignSelf: "stretch",
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    skillsTitle: { color: colors.offWhite, fontWeight: "800", fontSize: 16, marginBottom: 4 },
    skillRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    skillName: { color: colors.offWhite, fontWeight: "700" },
    skillCat: { color: colors.offWhite, opacity: 0.8, fontSize: 12 },
    footer: { padding: 16 },
    primaryBtn: {
        height: 56,
        borderRadius: 14,
        backgroundColor: colors.text,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: { color: colors.background, fontWeight: "600", fontSize: 20, letterSpacing: 0.5 },
});
