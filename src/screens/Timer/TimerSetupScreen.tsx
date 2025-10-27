// src/screens/Timer/TimerSetupScreen.tsx
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, View, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { BodyText, Header } from "@/theme/T";
import { colors, sharedStyle } from "@/theme/theme";
import { fmtMMSS } from "@/lib/time";
import { CustomTimePicker } from "@/screens/Timer/CustomTimePicker";
import { DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig } from "@/types/timer";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import SkillDisplayModal from "@/screens/Timer/SkillDisplayModal";

import { useRepos } from "@/lib/providers/RepoProvider";
import { useAuth } from "@/lib/AuthProvider";
import { useStyle } from "@/lib/providers/StyleProvider";
import { STYLE_TO_CATEGORIES } from "@/types/validation";
import type { Category } from "@/types/common";
import type { Technique } from "@/types/technique";
import { planBalanced, planSpecialized } from "@/screens/Timer/planner";
import { SKILL_PLAN_STORE_KEY, type SkillPlanSaved } from "@/types/skillPlan";

type Nav = NativeStackScreenProps<RootStackParamList, "TimerSetup">["navigation"];
type OpenPickerTarget = null | "rounds" | "round" | "rest" | "warmup";

// seed creator
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
        t += 0x6D2B79F5;
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

export default function TimerSetupScreen() {
    const nav = useNavigation<Nav>();

    // deps for dynamic planning
    const { skills } = useRepos();
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const { style: userStyle } = useStyle();

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

        for (const [c,rows] of results) {
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

            if (cfg.showSkills) {
                const rounds = Math.max(1, cfg.rounds);
                const seed = Date.now();

                const groupsRaw = await loadStyleGroups();
                const catOrder = seededShuffle(Object.keys(groupsRaw) as Category[], seed);
                const groupsShuffled: Record<Category, Technique[]> = {} as any;
                for (const cat of catOrder) {
                    const catSeed = seed ^ hashString(cat);
                    groupsShuffled[cat] = seededShuffle(groupsRaw[cat] ?? [], catSeed);
                }

                const nonEmpty: Record<Category, Technique[]> = {} as any;
                for (const cat of catOrder) {
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
                        plans = planBalanced(rounds, nonEmpty as any);
                    }
                } else {
                    // no style or no techniques — write empty rounds to keep Run stable
                    plans = Array.from({ length: rounds }, (_, i) => ({
                        roundIndex: i,
                        categoryFocus: null,
                        techniques: [],
                    }));
                    if (!userStyle) {
                        Alert.alert("Skills", "Pick your boxing style in Skills to enable round-by-round skill display.");
                    }
                }

                const blob: SkillPlanSaved = {
                    mode: (cfg.skillMode as any) ?? "balanced",
                    rounds,
                    specializedCategory: (cfg.specializedCategory as Category | null) ?? null,
                    plans,
                    createdAt: Date.now(),
                };
                await AsyncStorage.setItem(SKILL_PLAN_STORE_KEY, JSON.stringify(blob));
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
                    <Pill>{fmtMMSS(cfg.roundSec)}</Pill>
                </Row>

                {/* REST TIME */}
                <Row onPress={() => openPicker("rest")}>
                    <RowLabel>REST TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.restSec)}</Pill>
                </Row>

                {/* GET READY */}
                <Row onPress={() => openPicker("warmup")}>
                    <RowLabel>GET READY TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.warmupSec)}</Pill>
                </Row>

                {/* TOGGLES */}
                <ToggleRow
                    label="SKILL DISPLAY"
                    value={cfg.showSkills}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showSkills: v }))}
                    onMore={goSkillDisplay}
                />
                <ToggleRow
                    label="COMBO DISPLAY"
                    value={cfg.showCombos}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showCombos: v }))}
                    onMore={goComboDisplay}
                />
                <ToggleRow
                    label="MECHANICS DISPLAY"
                    value={cfg.showMechanics}
                    onValueChange={(v) => setCfg((c) => ({ ...c, showMechanics: v }))}
                    onMore={goMechanicsDisplay}
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
            <BodyText style={{ color: colors.offWhite, fontWeight: "700", fontSize: 20 }}>
                {children}
            </BodyText>
        </View>
    );
}

function ToggleRow({
                       label,
                       value,
                       onValueChange,
                       onMore,
                   }: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    onMore?: () => void;
}) {
    return (
        <View
            style={[
                S.row,
                { backgroundColor: colors.mainBtn, justifyContent: "space-between", height: 70, borderWidth: 0 },
            ]}
        >
            <BodyText style={{ color: colors.offWhite, fontWeight: "600", fontSize: 16 }}>{label}</BodyText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#667", true: colors.text }} thumbColor={value ? colors.mainBtn : "#bbb"} />
                {onMore && (
                    <Pressable onPress={onMore} style={({ pressed }) => [S.moreBtn, pressed && { opacity: 0.7 }]}>
                        <Ionicons name="cog-outline" color={colors.offWhite} size={30} />
                    </Pressable>
                )}
            </View>
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
