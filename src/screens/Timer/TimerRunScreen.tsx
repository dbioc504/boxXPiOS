// src/screens/Timer/TimerRunScreen.tsx
import React, {useEffect, useMemo, useRef, useState} from "react";
import {AppState, AppStateStatus, FlatList, Pressable, ScrollView, StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {BodyText, Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {fmtMMSS} from "@/lib/time";
import {DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig} from "@/types/timer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useKeepAwake} from "expo-keep-awake";
import {SKILL_PLAN_STORE_KEY, type SkillPlanSaved} from "@/types/skillPlan";
import {type Category, CATEGORY_LABEL} from "@/types/common";
import {useTenSecondClack, useTimerSounds} from "@/screens/Timer/useTimerSounds";
import {ensureNotifPermissions} from "@/notifications/setup";
import {useBackgroundCues} from './useBackgroundCues';
import {COMBO_DISPLAY_STORE_KEY, type ComboDisplaySaved} from "@/types/comboDisplay";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";
import {useAuth} from "@/lib/AuthProvider";
import {ComboMeta} from "@/lib/repos/combos.repo";
import {ComboRow} from "@/screens/Combos/ComboRow";
import { buildComboRoundSchedule, deriveFocusSeqFromCombos } from "./comboPlanner";



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
    const repo = useCombosRepo();
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [cfg, setCfg] = useState<TimerConfig | null>(null);
    const [plan, setPlan] = useState<SkillPlanSaved | null>(null);

    const [comboIds, setComboIds] = useState<string[] | null>(null);
    const [selectedCombos, setSelectedCombos] = useState<ComboMeta[]>([]);
    const [comboExpanded, setComboExpanded] = useState<Set<string>>(new Set());

    const [ps, setPs] = useState<PhaseState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [now, setNowMs] = useState(() => Date.now());

    const tickRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const bgAt = useRef<number | null>(null);
    const { playBell, playClack } = useTimerSounds();

    const prevPhaseRef = useRef<Phase | null>(null);
    useEffect(() => {
        if (!ps) return;
        if (ps.phase !== prevPhaseRef.current) {
            playBell();
            prevPhaseRef.current = ps.phase;
        }
    }, [ps, playBell]);

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
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(COMBO_DISPLAY_STORE_KEY);
                if (!raw) { setComboIds([]); return; }
                const saved = JSON.parse(raw) as ComboDisplaySaved;
                setComboIds(saved.selectedIds ?? []);
            } catch {
                setComboIds([]);
            }
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

    useEffect(() => {
        if (!comboIds || comboIds.length === 0) { setSelectedCombos([]); return; }

        let alive = true;
        (async () => {
            try {
                const all = await repo.listCombos();
                const byId = new Map(all.map(c => [c.id, c]));
                const picked = comboIds.map(id => byId.get(id)).filter(Boolean) as ComboMeta[];
                if (alive) setSelectedCombos(picked);
            } catch {
                if (alive) setSelectedCombos([]);
            }
        })();

        return () => { alive = false };
    }, [repo, comboIds, userId]);

    const remain = ps ? Math.max(0, remainingMs(ps, now)) : 0;
    const remainSec = Math.ceil(remain / 1000);

    useTenSecondClack(remainSec, ps?.phase, ps?.roundIndex, playClack);

    const progress = ps ? 1 - remain / ps.phaseDurationMs : 0;

    const phaseLabel =
        ps?.phase === "getReady" ? "GET READY" :
            ps?.phase === "round" ? `ROUND ${ps.roundIndex + 1} / ${cfg?.rounds ?? 1}` :
                ps?.phase === "rest" ? "REST" : "DONE";

    const color =
        ps?.phase === "getReady" || ps?.phase === "rest" ? colors.timerRed :
            ps?.phase === "round" ? colors.timerStart : colors.background;

    const roundDisplay = useMemo(() => {
        const none = { techs: [] as { id: string; title: string; category: string }[], focusLabel: "" };
        if (!plan || !cfg || !ps || !cfg.showSkills) return none;
        if (plan.rounds !== cfg.rounds) return none;
        if (ps.phase !== "round") return none;

        const rp = plan.plans.find((p) => p.roundIndex === ps.roundIndex);
        if (!rp) return none;

        const focusLabel = rp.categoryFocus ? CATEGORY_LABEL[rp.categoryFocus as Category] : "";

        const seen = new Set<string>();
        const techs = rp.techniques.filter((t) => {
            if (!t?.id) return false;
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
        });

        return { techs, focusLabel };
    }, [plan, cfg, ps]);

    useEffect(() => { ensureNotifPermissions().catch(() => {}); }, []);

    useBackgroundCues(ps, cfg ?? null, {
        bell: 'roundBell.wav',
        clack: 'sticksClack.wav'
    }, isRunning);

    const onToggleCombo = (id: string) => {
        setComboExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // combo rounds
    const rounds = Math.max(1, cfg?.rounds?? 1);

    const focusSeq = useMemo<(Category | null)[]>(() => {
        if (plan && cfg && plan.rounds === cfg.rounds) {
            return plan.plans.map(p => p.categoryFocus ?? null);
        }
        return deriveFocusSeqFromCombos(rounds, selectedCombos);
    }, [plan, cfg, rounds, selectedCombos]);

    const comboSchedule = useMemo<ComboMeta[][]>(() => {
        if (!selectedCombos.length) return Array.from({ length: rounds }, () => []);
        return buildComboRoundSchedule(rounds, selectedCombos, focusSeq);
    }, [rounds, selectedCombos, focusSeq]);

    const combosForRound = useMemo(
        () => (ps?.phase === "round" ? comboSchedule[ps.roundIndex] ?? [] : []),
        [ps?.phase, ps?.roundIndex, comboSchedule]
    );

    return (
        <SafeAreaView style={[sharedStyle.safeArea, styles.screen, { backgroundColor: color }]}>
            <ScrollView
                contentContainerStyle={styles.center}
                style={{ flex: 1, alignSelf: 'stretch' }}
            >
                <Header title={phaseLabel}/>

                {/*<BodyText style={[styles.phase, { color: colors.offWhite }]}>{phaseLabel}</BodyText>*/}
                <BodyText style={styles.time}>{fmtMMSS(remainSec)}</BodyText>

                <View style={styles.progressWrap}>
                    <View style={[
                        styles.progressBar,
                        { width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }
                    ]}/>
                </View>

                {!!roundDisplay.techs.length && (
                    <View style={styles.skillsWrap}>
                        <BodyText style={styles.skillsTitle}>
                            {"SKILLS"}
                            {roundDisplay.focusLabel ? ` - ${roundDisplay.focusLabel.toUpperCase()}` : ""}
                        </BodyText>

                        <FlatList
                            data={roundDisplay.techs}
                            keyExtractor={(t) => t.id}
                            renderItem={({ item }) => (
                                <View style={styles.skillRow}>
                                    <BodyText style={styles.skillName}>{item.title}</BodyText>
                                </View>
                            )}
                            contentContainerStyle={styles.skillList}
                            style={styles.skillListContainer}
                            scrollEnabled={false}
                            removeClippedSubviews={false}
                        />

                    </View>
                )}

                {cfg?.showCombos && ps?.phase === "round" && combosForRound.length > 0 && (
                    <View style={styles.skillsWrap}>
                        <BodyText style={styles.skillsTitle}>
                            {"COMBOS"}
                            {/* Optional: show which category is focused this round */}
                            {focusSeq[ps.roundIndex]
                                ? ` - ${CATEGORY_LABEL[focusSeq[ps.roundIndex] as Category]?.toUpperCase?.() || ""}`
                                : ""}
                        </BodyText>

                        <View style={styles.comboList}>
                            {combosForRound.map((meta) => (
                                <View key={meta.id} style={styles.comboItem}>
                                    <ComboRow
                                        meta={meta}
                                        userId={userId!}
                                        expanded={comboExpanded.has(meta.id)}
                                        onToggle={onToggleCombo}
                                        selectMode={false}
                                        selected={false}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>

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
    center: { alignItems: "center", paddingHorizontal: 16, gap: 3, alignSelf: "stretch" },
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
        width: "90%",
        maxWidth: 420,
        alignSelf: "center",
        alignItems: "center",
        marginTop: 12,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#030603'
    },
    skillsTitle: { color: colors.offWhite, fontWeight: "600", fontSize: 20, marginBottom: 4, textAlign: "center" },
    skillListContainer: { alignSelf: "center", width: "100%" },
    skillList: { paddingVertical: 6, gap: 16, alignItems: "center", width: "100%" },
    skillRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%" },
    skillName: { color: colors.offWhite, textAlign: "center" },
    skillCat: { color: colors.offWhite, opacity: 0.8, fontSize: 12 },
    comboList: { width: "100%", gap: 12, alignItems: "center" },
    comboItem: { width: "100%", maxWidth: 420, alignSelf: "center" },
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
