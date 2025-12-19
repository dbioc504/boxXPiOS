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
import {COMBO_DISPLAY_STORE_KEY, type ComboDisplaySaved} from "@/types/comboDisplay";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";
import {useAuth} from "@/lib/AuthProvider";
import {ComboMeta} from "@/lib/repos/combos.repo";
import {ComboRow} from "@/screens/Combos/ComboRow";
import { buildComboRoundSchedule, deriveFocusSeqFromCombos } from "./comboPlanner";
import { COMBO_PLAN_STORE_KEY, type ComboPlanSaved } from "@/screens/Timer/comboPlanner";
import { BASE_MECHANICS_CATALOG } from "@/screens/Mechanics/mechanicsCatalog.base";
import {
    MECH_PLAN_STORE_KEY,
    type MechanicsPlanSaved,
} from "@/screens/Timer/mechanicsPlanner";
import type { Mechanic } from "@/types/mechanic";
import { MOVEMENT_LABEL } from "@/types/common";
import {derivePhaseAtTime, Timeline} from "@/screens/Timer/timeline";
import {nextPhase} from "@/screens/Timer/cues";

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
    const [collapsedCombos, setCollapsedCombos] = useState<Set<string>>(new Set());
    const [comboPlan, setComboPlan] = useState<ComboPlanSaved | null>(null);

    const [ps, setPs] = useState<PhaseState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [now, setNowMs] = useState(() => Date.now());

    const tickRef = useRef<NodeJS.Timeout | null>(null);
    const { playBell, playClack } = useTimerSounds();

    const prevPhaseRef = useRef<Phase | null>(null);
    const [mechPlan, setMechPlan] = useState<MechanicsPlanSaved | null>(null);

    const appState = useRef<AppStateStatus>(AppState.currentState);
    const backgroundedAt = useRef<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(MECH_PLAN_STORE_KEY);
                setMechPlan(raw ? JSON.parse(raw) : null);
            } catch {
                setMechPlan(null);
            }
        })();
    }, []);

    const mechanicsForCurrentRound = useMemo<Mechanic[]>(() => {
        if (!mechPlan || !ps || ps.phase !== "round") return [];
        const entry = mechPlan.roundsMap.find(e => e.roundIndex === ps.roundIndex);
        if (!entry || !entry.mechanicIds?.length) return [];

        const byId = new Map(BASE_MECHANICS_CATALOG.items.map(m => [m.id, m] as const));
        return entry.mechanicIds.map(id => byId.get(id)).filter(Boolean) as Mechanic[];
    }, [mechPlan, ps?.phase, ps?.roundIndex]);

    useEffect(() => {
        setCollapsedCombos(new Set());
    }, [ps?.roundIndex]);

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
                const raw = await AsyncStorage.getItem(COMBO_PLAN_STORE_KEY);
                setComboPlan(raw ? JSON.parse(raw) : null);
            } catch {}
        })();
    }, []);

    const combosForCurrentRound = useMemo(() => {
        if (!comboPlan || !ps || ps.phase !== "round") return [];
        const entry = comboPlan.roundsMap.find(e => e.roundIndex === ps.roundIndex);
        if (!entry) return [];
        const byId = new Map(selectedCombos.map(c => [c.id, c] as const));
        return entry.comboIds.map(id => byId.get(id)).filter(Boolean) as ComboMeta[];
    }, [comboPlan, ps?.phase, ps?.roundIndex, selectedCombos]);

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

    const [timeline, setTimeline] = useState<Timeline | null>(null);

    useEffect(() => {
        if (!cfg) return;

        const first = makePhase(cfg.warmupSec > 0 ? "getReady" : "round", 0, cfg, now);

        setTimeline({
            anchorMs: Date.now(),
            ps: first,
            cfg,
        });

        setIsRunning(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [cfg]);

    useEffect(() => {
        if (!timeline || !cfg) return;

        const loop = () => {
            if (!isRunning) return;

            tickRef.current = setTimeout(() => {
                if (!isRunning) return;

                const t = Date.now();
                setNowMs(t);

                const derived = derivePhaseAtTime(timeline, t);
                setPs(derived);

                if (derived.phase === "done") {
                    setIsRunning(false);
                } else {
                    loop();
                }
            }, TICK_MS);
        };

        loop();

        return () => tickRef.current && clearTimeout(tickRef.current);
    }, [timeline, isRunning, cfg]);

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextState) => {
            const prevState = appState.current;
            appState.current = nextState;

            if (
                prevState === "active" &&
                (nextState === "inactive" || nextState === "background")
            ) {
                if (isRunning) {
                    backgroundedAt.current = Date.now();
                }
            }

            if (
                (prevState === "inactive" || prevState === "background") &&
                nextState === "active"
            ) {
                if (isRunning && timeline) {
                    const now = Date.now();

                    const derived = derivePhaseAtTime(timeline, now);
                    setPs(derived);
                    setNowMs(now);
                }

                backgroundedAt.current = null;
            }
        });

        return () => sub.remove();
    }, [isRunning, timeline]);

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

    const onToggleCombo = (id: string) => {
        setCollapsedCombos(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
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

    const combosForRound = combosForCurrentRound;

    const comboFocusLabel =
        combosForRound[0]?.category
            ? CATEGORY_LABEL[combosForRound[0].category as Category]?.toUpperCase?.() ?? ""
            : "";

    const onToggleRun = () => {
        const now = Date.now();

        if (isRunning && timeline) {
            const cur = derivePhaseAtTime(timeline, now);
            const rem = remainingMs(cur, now);

            setTimeline({
                anchorMs: now,
                ps: {
                    ...cur,
                    phaseDurationMs: rem,
                    phaseStartAtMs: now,
                },
                cfg: timeline.cfg
            });

            setIsRunning(false);
        } else if (!isRunning && timeline) {
            setTimeline({
                ...timeline,
                anchorMs: now,
                ps: {
                    ...timeline.ps,
                    phaseStartAtMs: now,
                },
            });

            setIsRunning(true);
        }
    };

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
                            {comboFocusLabel ? ` - ${comboFocusLabel}` : ""}
                        </BodyText>

                        <View style={styles.comboList}>
                            {combosForRound.map((meta) => (
                                <View key={meta.id} style={styles.comboItem}>
                                    <ComboRow
                                        meta={meta}
                                        userId={userId!}
                                        expanded={!collapsedCombos.has(meta.id)}
                                        onToggle={onToggleCombo}
                                        selectMode={false}
                                        selected={false}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* MECHANICS */}
                {cfg?.showMechanics && ps?.phase === "round" && mechanicsForCurrentRound.length > 0 && (
                    <View style={styles.skillsWrap}>
                        <BodyText style={styles.skillsTitle}>MECHANICS</BodyText>
                        <View style={styles.mechList}>
                            {mechanicsForCurrentRound.map(m => (
                                <MechanicCard key={m.id} item={m} />
                            ))}
                        </View>
                    </View>
                )}


            </ScrollView>

            <View style={styles.footer}>
                <PrimaryBtn
                    label={isRunning ? "Pause" : "Resume"}
                    onPress={onToggleRun}
                />
            </View>
        </SafeAreaView>
    );
}

// helpers
function MechanicCard({ item }: { item: Mechanic }) {
    const title =
        item.kind === "movement"
            ? (MOVEMENT_LABEL[item.movement] ?? item.movement)
            : item.title;

    return (
        <View style={styles.mechCard}>
            <BodyText style={styles.mechTitle}>{title}</BodyText>
            <View style={{ gap: 6 }}>
                {item.bullets
                    .filter(b => b.text?.trim().length)
                    .map(b => (
                        <View key={b.id} style={styles.mechBulletRow}>
                            <BodyText style={styles.mechDot}>{"\u2022"}</BodyText>
                            <BodyText style={styles.mechBullet}>{b.text}</BodyText>
                        </View>
                    ))}
            </View>
        </View>
    );
}


function makePhase(
    phase: Phase,
    roundIndex: number,
    cfg: TimerConfig,
    startAtMs: number
): PhaseState {
    const durMs =
        phase === "getReady" ? cfg.warmupSec * 1000 :
            phase === "round" ? cfg.roundSec * 1000 :
                phase === "rest" ? cfg.restSec * 1000 : 0;
    return { phase, roundIndex, phaseDurationMs: durMs, phaseStartAtMs: startAtMs };
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
    mechList: { width: "100%", gap: 10, alignItems: "center" },
    mechCard: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 12,
        padding: 12,
    },
    mechTitle: {
        color: colors.offWhite,
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 6,
        textAlign: "center",
    },
    mechBulletRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    mechDot: { color: colors.offWhite, fontSize: 16, lineHeight: 20 },
    mechBullet: { color: colors.offWhite, fontSize: 14, lineHeight: 20, flex: 1 },

});
