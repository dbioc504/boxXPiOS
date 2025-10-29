// src/screens/Timer/TimerSetupScreen.tsx
import React, {useEffect, useState} from "react";
import {ActivityIndicator, Alert, Pressable, StyleSheet, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useNavigation} from "@react-navigation/native";
import {BodyText, Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {fmtMMSS} from "@/lib/time";
import {CustomTimePicker} from "@/screens/Timer/CustomTimePicker";
import {DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig} from "@/types/timer";
import type {RootStackParamList} from "@/navigation/RootNavigator";
import ToggleRow from '@/screens/Timer/ToggleRow';
import SkillDisplayModal from "@/screens/Timer/SkillDisplayModal";

import {useRepos} from "@/lib/providers/RepoProvider";
import {useAuth} from "@/lib/AuthProvider";
import {useStyle} from "@/lib/providers/StyleProvider";
import {STYLE_TO_CATEGORIES} from "@/types/validation";
import type {Category} from "@/types/common";
import type {Technique} from "@/types/technique";
import {planBalanced, planSpecialized} from "@/screens/Timer/planner"; // use the updated file
import {SKILL_PLAN_STORE_KEY, type SkillPlanSaved} from "@/types/skillPlan";
import {
    alignFocusSeqToAvailable,
    buildComboRoundSchedule,
    COMBO_PLAN_STORE_KEY,
    type ComboPlanSaved,
    deriveFocusSeqFromCombos,
    NO_CAT,
} from "@/screens/Timer/comboPlanner";
import {COMBO_DISPLAY_STORE_KEY, type ComboDisplaySaved} from "@/types/comboDisplay";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";
import type {ComboMeta} from "@/lib/repos/combos.repo";

type Nav = NativeStackScreenProps<RootStackParamList, "TimerSetup">["navigation"];
type OpenPickerTarget = null | "rounds" | "round" | "rest" | "warmup";

/** --- seeded shuffle helpers (fresh randomness per session) --- */
const hashString = (s: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};
const mulberry32 = (seed: number) => {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
};
const seededShuffle = <T,>(arr: T[], seed: number): T[] => {
    const a = arr.slice();
    const rnd = mulberry32(seed);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/** ---------- rotation state persisted in AsyncStorage ---------- */
const ROTATE_KEY = "focus_rotation.v1";
type RotMap = {
    skills?: Record<string, number>;
    combos?: Record<string, number>;
};

// returns the current offset (then advances it for next time)
async function getAndAdvanceRotation(ns: "skills" | "combos", cats: string[]): Promise<number> {
    const raw = await AsyncStorage.getItem(ROTATE_KEY);
    const map: RotMap = raw ? JSON.parse(raw) : {};
    const bag = (map[ns] ??= {});
    const catsKey = cats.join("|");
    const current = bag[catsKey] ?? 0;
    bag[catsKey] = current + 1;
    await AsyncStorage.setItem(ROTATE_KEY, JSON.stringify(map));
    return current;
}

export default function TimerSetupScreen() {
    const nav = useNavigation<Nav>();

    // deps for dynamic planning
    const { skills } = useRepos();
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const { style: userStyle } = useStyle();
    const combos = useCombosRepo();

    const [cfg, setCfg] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
    const [open, setOpen] = useState<OpenPickerTarget>(null);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [starting, setStarting] = useState(false);

    // hydrate timer config
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(TIMER_STORE_KEY);
                if (raw) setCfg({ ...DEFAULT_TIMER_CONFIG, ...JSON.parse(raw) });
            } catch {}
        })();
    }, []);

    // persist timer config
    useEffect(() => {
        AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(cfg)).catch(() => {});
    }, [cfg]);

    // Build category -> techniques for the user’s style
    const loadStyleGroups = async (): Promise<Record<Category, Technique[]>> => {
        const out: Record<Category, Technique[]> = {} as any;
        if (!userId || !userStyle) return out;
        const allowedCats = STYLE_TO_CATEGORIES[userStyle] ?? [];
        if (allowedCats.length === 0) return out;

        // keep fetch but we will keep category order stable later
        const results = await Promise.all(
            allowedCats.map(async (c) => {
                try {
                    const rows = await skills.listUserTechniques(userId, c);
                    return [c, rows ?? []] as const;
                } catch {
                    return [c, []] as const;
                }
            })
        );

        for (const [c, rows] of results) {
            if (rows.length) out[c as Category] = rows as Technique[];
        }
        return out;
    };

    const openPicker = (t: OpenPickerTarget) => setOpen(t);
    const closePicker = () => setOpen(null);

    const setPicked = (value: number) => {
        if (open === "rounds") setCfg((c) => ({ ...c, rounds: value }));
        if (open === "round") setCfg((c) => ({ ...c, roundSec: value }));
        if (open === "rest") setCfg((c) => ({ ...c, restSec: value }));
        if (open === "warmup") setCfg((c) => ({ ...c, warmupSec: value }));
        closePicker();
    };

    const goSkillDisplay = () => setShowSkillModal(true);
    const goComboDisplay = () => nav.navigate("ComboDisplay");
    const goMechanicsDisplay = () => nav.navigate("MechanicsDisplay");

    const onStart = async () => {
        try {
            setStarting(true);
            const rounds = Math.max(1, cfg.rounds);
            const seed = Date.now();

            /** -------------------- SKILL PLAN -------------------- */
            if (cfg.showSkills) {
                const groupsRaw = await loadStyleGroups();

                // Stable category list for rotation; shuffle techniques inside each category for freshness
                const stableCats = (Object.keys(groupsRaw) as Category[]).sort((a, b) => String(a).localeCompare(String(b)));

                const groupsShuffled: Record<Category, Technique[]> = {} as any;
                for (const cat of stableCats) {
                    const catSeed = seed ^ hashString(String(cat));
                    groupsShuffled[cat] = seededShuffle(groupsRaw[cat] ?? [], catSeed);
                }

                // keep only non-empty categories (in stable order)
                const nonEmpty: Record<Category, Technique[]> = {} as any;
                for (const cat of stableCats) {
                    const arr = groupsShuffled[cat];
                    if (arr && arr.length) nonEmpty[cat] = arr;
                }

                let plans: SkillPlanSaved["plans"];
                if (Object.keys(nonEmpty).length > 0 && userStyle) {
                    if (cfg.skillMode === "specialized" && cfg.specializedCategory) {
                        plans = planSpecialized(
                            rounds,
                            nonEmpty as any,
                            cfg.specializedCategory as Category,
                            0.7,
                            { noRepeats: true }
                        );
                    } else {
                        // Rotating start for BALANCED
                        const skillCats = Object.keys(nonEmpty) as Category[];
                        const startOffset = await getAndAdvanceRotation("skills", skillCats);
                        plans = planBalanced(rounds, nonEmpty as any, startOffset);
                    }
                } else {
                    // empty fallback
                    plans = Array.from({ length: rounds }, (_, i) => ({
                        roundIndex: i,
                        categoryFocus: null,
                        techniques: [],
                    }));
                    if (!userStyle) {
                        Alert.alert("Skills", "Pick your boxing style in Skills to enable round-by-round skill display.");
                    }
                }

                const skillBlob: SkillPlanSaved = {
                    mode: (cfg.skillMode as any) ?? "balanced",
                    rounds,
                    specializedCategory: (cfg.specializedCategory as Category | null) ?? null,
                    plans,
                    createdAt: Date.now(),
                };
                await AsyncStorage.setItem(SKILL_PLAN_STORE_KEY, JSON.stringify(skillBlob));
            }

            /** -------------------- COMBO PLAN -------------------- */
            if (cfg.showCombos) {
                const rawSel = await AsyncStorage.getItem(COMBO_DISPLAY_STORE_KEY);
                const selectedIds = rawSel ? (JSON.parse(rawSel) as ComboDisplaySaved).selectedIds ?? [] : [];

                const all = await combos.listCombos();
                const byId = new Map(all.map((c) => [c.id, c] as const));
                let picked: ComboMeta[] = selectedIds.map((id) => byId.get(id)).filter(Boolean) as ComboMeta[];

                // light shuffle for freshness without changing category membership
                picked = seededShuffle(picked, seed);

                // read the skill plan if present
                const skillRaw = await AsyncStorage.getItem(SKILL_PLAN_STORE_KEY);
                const skillBlob: SkillPlanSaved | null = skillRaw ? JSON.parse(skillRaw) : null;

                let focusSeq: (Category | null)[];

                if (cfg.showSkills && skillBlob?.plans?.length === rounds) {
                    // 1) start from the skills’ category for each round
                    const skillsFocus = skillBlob.plans.map((p) => p.categoryFocus ?? null);

                    // 2) align each round’s focus to a category that actually has selected combos;
                    //    if a skills focus has no combos, pick the next available category for that round.
                    focusSeq = alignFocusSeqToAvailable(skillsFocus, picked, 0);

                    // 3) build rounds and enforce “strict focus” so we can take back-to-back from the focused category
                    const perRoundCombos = buildComboRoundSchedule(rounds, picked, focusSeq, { strictFocus: true });

                    const comboPlan: ComboPlanSaved = {
                        rounds,
                        roundsMap: perRoundCombos.map((arr, roundIndex) => ({
                            roundIndex,
                            comboIds: arr.map((c) => c.id),
                        })),
                        createdAt: Date.now(),
                    };
                    await AsyncStorage.setItem(COMBO_PLAN_STORE_KEY, JSON.stringify(comboPlan));
                } else {
                    // SkillDisplay is off or missing — use rotating combo focus sequence
                    const catsFromCombos = Array.from(new Set(picked.map((c) => c.category ?? NO_CAT)));
                    const startOffset = await getAndAdvanceRotation("combos", catsFromCombos);
                    focusSeq = deriveFocusSeqFromCombos(rounds, picked, startOffset);

                    const perRoundCombos = buildComboRoundSchedule(rounds, picked, focusSeq, { strictFocus: false });

                    const comboPlan: ComboPlanSaved = {
                        rounds,
                        roundsMap: perRoundCombos.map((arr, roundIndex) => ({
                            roundIndex,
                            comboIds: arr.map((c) => c.id),
                        })),
                        createdAt: Date.now(),
                    };
                    await AsyncStorage.setItem(COMBO_PLAN_STORE_KEY, JSON.stringify(comboPlan));
                }
            }

            nav.navigate("TimerRun");
        } catch (e: any) {
            Alert.alert("Start", e?.message ?? "Could not start workout.");
        } finally {
            setStarting(false);
        }
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="TIMER" />

            <View style={{ paddingHorizontal: 12, gap: 12 }}>
                {/* ROUNDS */}
                <Row onPress={() => openPicker("rounds")}>
                    <RowLabel>ROUNDS</RowLabel>
                    <Pill>{cfg.rounds}</Pill>
                </Row>

                {/* ROUND TIME */}
                <Row onPress={() => openPicker("round")}>
                    <RowLabel>ROUND TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.roundSec, { padMinutes: true })}</Pill>
                </Row>

                {/* REST TIME */}
                <Row onPress={() => openPicker("rest")}>
                    <RowLabel>REST TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.restSec, { padMinutes: true })}</Pill>
                </Row>

                {/* GET READY */}
                <Row onPress={() => openPicker("warmup")}>
                    <RowLabel>GET READY TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.warmupSec, { padMinutes: true })}</Pill>
                </Row>

                {/* TOGGLES */}
                <ToggleRow
                    label="SKILL DISPLAY"
                    value={cfg.showSkills}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showSkills: v }))}
                    onMore={() => setShowSkillModal(true)}
                />
                <ToggleRow
                    label="COMBO DISPLAY"
                    value={cfg.showCombos}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showCombos: v }))}
                    onMore={() => nav.navigate("ComboDisplay")}
                />
                <ToggleRow
                    label="MECHANICS DISPLAY"
                    value={cfg.showMechanics}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showMechanics: v }))}
                    onMore={() => nav.navigate("MechanicsDisplay")}
                />

                {/* actions */}
                <View style={{ flexDirection: "row", marginTop: 4, alignSelf: "flex-end" }}>
                    <PrimaryBtn label={starting ? "Starting..." : "START"} onPress={onStart} disabled={starting} />
                </View>

                <SkillDisplayModal
                    visible={showSkillModal}
                    onClose={() => setShowSkillModal(false)}
                    onSaved={() => setShowSkillModal(false)}
                />
            </View>

            {open && (
                <CustomTimePicker
                    mode={
                        open === "rounds"
                            ? "rounds"
                            : open === "round"
                                ? "roundTime"
                                : open === "rest"
                                    ? "restTime"
                                    : "getReadyTime"
                    }
                    initialValue={
                        open === "rounds"
                            ? cfg.rounds
                            : open === "round"
                                ? cfg.roundSec
                                : open === "rest"
                                    ? cfg.restSec
                                    : cfg.warmupSec
                    }
                    onClose={closePicker}
                    onConfirm={setPicked}
                />
            )}
        </SafeAreaView>
    );
}

/** -------------------- presentation bits -------------------- */

function Row({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                S.row,
                { opacity: pressed ? 0.7 : 1 },
                pressed && {
                    backgroundColor: colors.signIn,
                    transform: [{ scale: 1.02 }],
                    borderColor: colors.form,
                },
            ]}
        >
            {children}
        </Pressable>
    );
}

function RowLabel({ children }: { children: React.ReactNode }) {
    return (
        <BodyText style={{ color: colors.offWhite, fontWeight: "700", fontSize: 16 }}>
            {children}
        </BodyText>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <View style={S.pill}>
            <BodyText style={{ color: colors.offWhite, fontWeight: "700", fontSize: 20 }}>{children}</BodyText>
        </View>
    );
}

function PrimaryBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                S.primaryBtn,
                {
                    backgroundColor: disabled ? "#4b4f64" : pressed ? "#225322" : colors.timerStart,
                },
            ]}
        >
            {disabled ? (
                <ActivityIndicator color="white" />
            ) : (
                <BodyText style={{ fontWeight: "700", fontSize: 18, color: "white" }}>{label}</BodyText>
            )}
        </Pressable>
    );
}

const S = StyleSheet.create({
    row: {
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.mainBtn,
    },
    pill: {
        minWidth: 74,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        backgroundColor: colors.categories,
    },
    primaryBtn: {
        flex: 1,
        height: 80,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    smallBtn: {
        width: 38,
        height: 32,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    moreBtn: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f2a44",
    },
});
