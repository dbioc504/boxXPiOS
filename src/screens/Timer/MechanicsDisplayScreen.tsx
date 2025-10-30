import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Header, BodyText } from "@/theme/T";
import { colors, sharedStyle } from "@/theme/theme";
import { ExpandableSection } from "@/screens/Skills/ExpandableSection";
import { RadioRow } from "@/screens/Skills/RadioRow";
import {
    MECHANICS_GROUP,
    MECHANICS_GROUP_LABEL,
    type MechanicsGroup,
} from "@/types/mechanic";
import { BASE_MECHANICS_CATALOG } from "@/screens/Mechanics/mechanicsCatalog.base";
import {
    MECH_PLAN_STORE_KEY,
    alignFocusSeqToAvailableForCategory,
    buildMechanicRoundSchedule,
    deriveFocusSeqFromGroups,
    type MechanicsPlanSaved,
} from "@/screens/Timer/mechanicsPlanner";
import { DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY } from "@/types/timer";
import { SKILL_PLAN_STORE_KEY, type SkillPlanSaved } from "@/types/skillPlan";

export type MechanicsDisplayMode = "sync" | "balanced" | "group";

export type MechanicsDisplaySaved = {
    mode: MechanicsDisplayMode;
    selectedGroups?: MechanicsGroup[];
    createdAt: number;
};

export const MECH_DISPLAY_STORE_KEY = "mechanics_display.v1";

export default function MechanicsDisplayScreen() {
    const nav = useNavigation();
    const [mode, setMode] = useState<MechanicsDisplayMode>("sync");
    const [selected, setSelected] = useState<Set<MechanicsGroup>>(new Set());
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const counts = useMemo(() => {
        const c = new Map<MechanicsGroup, number>();
        for (const item of BASE_MECHANICS_CATALOG.items) {
            c.set(item.group, (c.get(item.group) ?? 0) + 1);
        }
        return c;
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(MECH_DISPLAY_STORE_KEY);
                if (raw) {
                    const prev = JSON.parse(raw) as MechanicsDisplaySaved;
                    setMode(prev.mode ?? "sync");
                    setSelected(new Set(prev.selectedGroups ?? []));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleGroup = useCallback((g: MechanicsGroup) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(g)) next.delete(g);
            else next.add(g);
            return next;
        });
    }, []);

    const onSave = useCallback(async () => {
        const selectedGroups = Array.from(selected);
        if (mode === "group" && selectedGroups.length === 0) {
            Alert.alert("Mechanics", "Pick at least one group to include.");
            return;
        }

        try {
            setSaving(true);
            const payload: MechanicsDisplaySaved = {
                mode,
                selectedGroups,
                createdAt: Date.now(),
            };
            await AsyncStorage.setItem(MECH_DISPLAY_STORE_KEY, JSON.stringify(payload));

            const rawCfg = await AsyncStorage.getItem(TIMER_STORE_KEY);
            const cfg = rawCfg ? { ...DEFAULT_TIMER_CONFIG, ...JSON.parse(rawCfg) } : DEFAULT_TIMER_CONFIG;
            const rounds = Math.max(1, cfg.rounds ?? DEFAULT_TIMER_CONFIG.rounds);

            const allItems = BASE_MECHANICS_CATALOG.items.slice();
            let activeGroups = Array.from(new Set(allItems.map((m) => m.group))).sort((a, b) =>
                a.localeCompare(b)
            );
            let pool = allItems;

            if (mode === "group") {
                const chosen = new Set(selectedGroups);
                pool = pool.filter((m) => chosen.has(m.group));
                activeGroups = Array.from(chosen).sort((a, b) => a.localeCompare(b));
            }

            if (!pool.length) {
                const empty: MechanicsPlanSaved = {
                    rounds,
                    roundsMap: Array.from({ length: rounds }, (_, roundIndex) => ({
                        roundIndex,
                        mechanicIds: [],
                    })),
                    createdAt: Date.now(),
                };
                await AsyncStorage.setItem(MECH_PLAN_STORE_KEY, JSON.stringify(empty));
                nav.goBack();
                return;
            }

            let mechPlan: MechanicsPlanSaved;

            if (mode === "sync") {
                const skillRaw = await AsyncStorage.getItem(SKILL_PLAN_STORE_KEY);
                const skillBlob: SkillPlanSaved | null = skillRaw ? JSON.parse(skillRaw) : null;
                const skillCats = skillBlob?.plans?.map((p) => p.categoryFocus ?? null) ?? [];

                const fallbackGroups = activeGroups.length
                    ? activeGroups
                    : Array.from(new Set(pool.map((m) => m.group))).sort((a, b) => a.localeCompare(b));

                const focusSeqGuess = Array.from({ length: rounds }, (_, i) =>
                    fallbackGroups.length ? fallbackGroups[i % fallbackGroups.length] : null
                );

                const focusSeq = alignFocusSeqToAvailableForCategory(focusSeqGuess, skillCats, pool);
                const perRound = buildMechanicRoundSchedule(rounds, pool, {
                    focusSeq,
                    targetCategorySeq: skillCats,
                    strictFocus: true,
                });

                mechPlan = {
                    rounds,
                    roundsMap: perRound.map((arr, roundIndex) => ({
                        roundIndex,
                        mechanicIds: arr.map((m) => m.id),
                    })),
                    createdAt: Date.now(),
                };
            } else {
                const fallbackGroups = activeGroups.length
                    ? activeGroups
                    : Array.from(new Set(pool.map((m) => m.group))).sort((a, b) => a.localeCompare(b));
                const focusSeq = deriveFocusSeqFromGroups(rounds, fallbackGroups, 0);
                const perRound = buildMechanicRoundSchedule(rounds, pool, {
                    focusSeq,
                    strictFocus: false,
                });

                mechPlan = {
                    rounds,
                    roundsMap: perRound.map((arr, roundIndex) => ({
                        roundIndex,
                        mechanicIds: arr.map((m) => m.id),
                    })),
                    createdAt: Date.now(),
                };
            }

            await AsyncStorage.setItem(MECH_PLAN_STORE_KEY, JSON.stringify(mechPlan));
            nav.goBack();
        } catch (e: any) {
            Alert.alert("Mechanics", e?.message ?? "Failed to save mechanics plan.");
        } finally {
            setSaving(false);
        }
    }, [mode, nav, selected]);

    if (loading) {
        return(
            <SafeAreaView style={sharedStyle.safeArea}>
                <Header title="MECHANIC DISPLAY" isModal/>
                <View style={{ padding: 16 }}>
                    <ActivityIndicator color={colors.offWhite}/>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="MECHANIC DISPLAY"/>

            <View style={S.page}>
                <ScrollView contentContainerStyle={S.scrollContent}>
                    <ExpandableSection
                id="mech-sync"
                title="Sync with Skill Display"
                defaultExpanded
                isStyleCard={false}
                showRadio={false}
                selected={mode === "sync"}
            >
                <BodyText style={S.help}>
                    Mechanics follow your Skill Display’s round-by-round category focus.
                    We’ll prefer mechanics tagged to that category inside each group.
                </BodyText>
                <View style={S.centerRadio}>
                    <RadioRow
                        label="SELECTED"
                        value={"sync" as any}
                        selected={mode as any}
                        onSelect={() => setMode("sync")}
                    />
                </View>
            </ExpandableSection>

            <ExpandableSection
                id="mech-balanced"
                title="Balanced"
                defaultExpanded
                isStyleCard={false}
                showRadio={false}
                selected={mode === "balanced"}
            >
                <BodyText style={S.help}>
                    Evenly rotate across all mechanic groups. Randomized within each group.
                </BodyText>
                <View style={S.centerRadio}>
                    <RadioRow
                        label="SELECTED"
                        value={"balanced" as any}
                        selected={mode as any}
                        onSelect={() => setMode("balanced")}
                    />
                </View>
            </ExpandableSection>

            <ExpandableSection
                id="mech-group"
                title="Group Selection"
                defaultExpanded
                isStyleCard={false}
                showRadio={false}
                selected={mode === "group"}
            >
                <BodyText style={S.help}>
                    Pick which groups to include. We’ll rotate through your choices.
                </BodyText>

                <View style={{ marginTop: 6 }}>
                    {MECHANICS_GROUP.map((g) => (
                        <Pressable key={g} onPress={() => toggleGroup(g)} style={S.groupRow}>
                            <BodyText style={{ color: colors.offWhite, fontSize: 16 }}>
                                {MECHANICS_GROUP_LABEL[g]}{" "}
                                <BodyText style={{ color: colors.offWhite, opacity: 0.7 }}>
                                    ({counts.get(g) ?? 0})
                                </BodyText>
                            </BodyText>
                            <View
                                style={[
                                    S.checkbox,
                                    { backgroundColor: selected.has(g) ? colors.text : "transparent" },
                                ]}
                            />
                        </Pressable>
                    ))}
                </View>

                <View style={[S.centerRadio, { marginTop: 10 }]}>
                    <RadioRow
                        label="SELECTED"
                        value={"group" as any}
                        selected={mode as any}
                        onSelect={() => setMode("group")}
                    />
                </View>
            </ExpandableSection>

                </ScrollView>

            {/* Save */}
            <View style={S.saveWrap}>
                <Pressable
                    onPress={onSave}
                    disabled={saving}
                    style={({ pressed }) => [
                        S.saveBtn,
                        { backgroundColor: colors.text, opacity: pressed ? 0.7 : 1 },
                    ]}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <BodyText style={S.saveText}>SAVE</BodyText>
                    )}
                </Pressable>
            </View>
            </View>
        </SafeAreaView>
    )
}

const S = StyleSheet.create({
    page: { flex: 1 },
    scrollContent: { paddingBottom: 140 },
    help: { color: colors.offWhite, opacity: 0.9, marginBottom: 8 },
    centerRadio: {
        marginTop: 6,
        borderWidth: 2,
        borderColor: colors.offWhite,
        borderRadius: 10,
        alignItems: "center",
    },
    groupRow: {
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.offWhite,
        paddingHorizontal: 12,
        marginBottom: 6,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.mainBtn,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.offWhite,
    },
    saveWrap: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.offWhite,
        backgroundColor: colors.background,
    },
    saveBtn: {
        height: 72,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    saveText: { fontWeight: "600", fontSize: 20, letterSpacing: 0.5 },
});
