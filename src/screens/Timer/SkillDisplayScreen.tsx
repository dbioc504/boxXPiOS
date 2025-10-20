// src/screens/Timer/SkillDisplayScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BodyText, Header } from "@/theme/T";
import { colors, sharedStyle } from "@/theme/theme";

import { CATEGORY_LABEL, type Category, ACTIVITIES } from "@/types/common";
import type { Technique } from "@/types/technique";
import { DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig } from "@/types/timer";
import { planBalanced, planSpecialized, type RoundPlan } from "@/screens/Timer/planner";
import { ExpandableSection } from "@/screens/Skills/ExpandableSection";
import { RadioRowGeneric } from "./RadioRowGeneric";

// your providers
import { useRepos } from "@/lib/providers/RepoProvider";
import { useAuth } from "@/lib/AuthProvider";

export default function SkillDisplayScreen() {
    const [cfg, setCfg] = useState<TimerConfig | null>(null);
    const [byCat, setByCat] = useState<Record<Category, Technique[]>>({} as any);
    const [roundIndex, setRoundIndex] = useState(0); // can be controlled by TimerRun if you prefer

    const { skills } = useRepos();
    const { user } = useAuth();
    const userId = user?.id ?? null;

    // load the timer config
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(TIMER_STORE_KEY);
                const loaded = raw ? { ...DEFAULT_TIMER_CONFIG, ...JSON.parse(raw) } : DEFAULT_TIMER_CONFIG;
                setCfg(loaded);
            } catch {
                setCfg(DEFAULT_TIMER_CONFIG);
            }
        })();
    }, []);

    // load techniques per category using your repo signature
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!userId) {
                setByCat({} as any);
                return;
            }

            // only load categories that exist for the user style. If you have a StyleProvider, you can narrow here.
            const cats = Object.keys(CATEGORY_LABEL) as Category[];
            const all: Record<Category, Technique[]> = {} as any;

            for (const c of cats) {
                try {
                    const rows = await skills.listUserTechniques(userId, c);
                    if (cancelled) return;
                    if (rows && rows.length > 0) {
                        all[c] = rows.map(r => ({ ...r, category: c }));
                    }
                } catch {
                    // ignore category with failure
                }
            }
            if (!cancelled) setByCat(all);
        })();

        return () => { cancelled = true };
    }, [skills, userId]);

    // compute plans
    const plans = useMemo<RoundPlan[]>(() => {
        if (!cfg) return [];
        const rounds = Math.max(1, cfg.rounds);

        // remove empty categories so rotation is meaningful
        const nonEmpty: Record<Category, Technique[]> = {} as any;
        for (const k of Object.keys(byCat) as Category[]) {
            if ((byCat[k]?.length ?? 0) > 0) nonEmpty[k] = byCat[k];
        }

        if (Object.keys(nonEmpty).length === 0) return Array.from({ length: rounds }, (_, i) => ({
            roundIndex: i, categoryFocus: null, techniques: []
        }));

        if (cfg.skillMode === "specialized") {
            const pick = cfg.specializedCategory ?? guessDefaultCategory(nonEmpty);
            return planSpecialized(rounds, nonEmpty, pick, 0.7);
        }
        return planBalanced(rounds, nonEmpty);
    }, [cfg, byCat]);

    // current and next
    const idx = Math.min(Math.max(0, roundIndex), Math.max(0, plans.length - 1));
    const current = plans[idx];
    const next = plans[idx + 1];

    // persist small edits to config
    const saveCfg = useCallback((patch: Partial<TimerConfig>) => {
        setCfg(prev => {
            const nextCfg = { ...(prev ?? DEFAULT_TIMER_CONFIG), ...patch };
            AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(nextCfg)).catch(() => {});
            return nextCfg;
        });
    }, []);

    const setMode = (m: "balanced" | "specialized") => saveCfg({ skillMode: m });
    const setSpecializedCategory = (c: Category) => saveCfg({ specializedCategory: c });

    const categoriesList = useMemo(() => {
        return (Object.keys(byCat) as Category[]).filter(c => (byCat[c]?.length ?? 0) > 0);
    }, [byCat]);

    return (
        <SafeAreaView style={[sharedStyle.safeArea, styles.screen]}>
            <Header title="SKILL DISPLAY" />

            {/* Controls */}
            <View style={{ paddingHorizontal: 12, gap: 12, marginTop: 6 }}>
                <ExpandableSection id="mode" title="Mode" defaultExpanded isStyleCard={false} showRadio={false}>
                    <View style={{ gap: 8 }}>
                        <RadioRowGeneric
                            label="Balanced"
                            value="balanced"
                            selected={cfg?.skillMode ?? "balanced"}
                            onSelect={() => setMode("balanced")}
                        />
                        <RadioRowGeneric
                            label="Specialized"
                            value="specialized"
                            selected={cfg?.skillMode ?? "balanced"}
                            onSelect={() => setMode("specialized")}
                        />
                    </View>
                </ExpandableSection>

                {cfg?.skillMode === "specialized" && (
                    <ExpandableSection id="category" title="Specialized Category" defaultExpanded isStyleCard={false} showRadio={false}>
                        <View style={{ gap: 8 }}>
                            {categoriesList.length === 0 ? (
                                <BodyText style={{ color: colors.offWhite, opacity: 0.8 }}>
                                    Add techniques to at least one category
                                </BodyText>
                            ) : (
                                categoriesList.map(cat => (
                                    <RadioRowGeneric<Category>
                                        key={cat}
                                        label={CATEGORY_LABEL[cat]}
                                        value={cat}
                                        selected={cfg?.specializedCategory ?? null}
                                        onSelect={setSpecializedCategory}
                                    />
                                ))
                            )}
                        </View>
                    </ExpandableSection>
                )}
            </View>

            {/* Current round list */}
            {!current ? (
                <View style={styles.emptyWrap}>
                    <BodyText style={styles.emptyText}>No skills to show</BodyText>
                </View>
            ) : (
                <>
                    <View style={styles.metaRow}>
                        <BodyText style={styles.metaLeft}>
                            Round {current.roundIndex + 1} of {plans.length}
                        </BodyText>
                        <BodyText style={styles.metaRight}>
                            Focus {labelForCategory(current.categoryFocus)}
                        </BodyText>
                    </View>

                    <FlatList
                        data={current.techniques}
                        keyExtractor={t => t.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                        renderItem={({ item }) => (
                            <View style={styles.techRow}>
                                <BodyText style={styles.techTitle}>{item.title}</BodyText>
                                <BodyText style={styles.techCat}>{CATEGORY_LABEL[item.category]}</BodyText>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyRound}>
                                <BodyText style={styles.emptyText}>No items this round</BodyText>
                            </View>
                        }
                    />

                    {/* Simple local controls for now */}
                    <View style={styles.roundControls}>
                        <Pressable
                            onPress={() => setRoundIndex(i => Math.max(0, i - 1))}
                            style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.8 }]}
                        >
                            <BodyText style={styles.roundBtnText}>Prev</BodyText>
                        </Pressable>
                        <Pressable
                            onPress={() => setRoundIndex(i => Math.min(plans.length - 1, i + 1))}
                            style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.8 }]}
                        >
                            <BodyText style={styles.roundBtnText}>Next</BodyText>
                        </Pressable>
                    </View>

                    {next && (
                        <View style={styles.nextWrap}>
                            <BodyText style={styles.nextTitle}>Next round focus</BodyText>
                            <BodyText style={styles.nextCat}>{labelForCategory(next.categoryFocus)}</BodyText>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

function labelForCategory(cat: Category | null): string {
    if (!cat) return "None";
    return CATEGORY_LABEL[cat] ?? cat;
}

function guessDefaultCategory(groups: Record<Category, Technique[]>): Category {
    let best: Category | null = null;
    let max = -1;
    (Object.keys(groups) as Category[]).forEach(c => {
        const n = groups[c]?.length ?? 0;
        if (n > max) { best = c; max = n; }
    });
    return best ?? "pressure";
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    metaRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
    metaLeft: { color: colors.offWhite, fontWeight: "700" },
    metaRight: { color: colors.offWhite, fontWeight: "700" },
    techRow: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.offWhite,
        backgroundColor: colors.mainBtn,
        marginTop: 10,
    },
    techTitle: { color: colors.offWhite, fontWeight: "700", fontSize: 16 },
    techCat: { color: colors.offWhite, opacity: 0.8, marginTop: 2 },
    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyRound: { padding: 24, alignItems: "center" },
    emptyText: { color: colors.offWhite, opacity: 0.8 },
    nextWrap: { padding: 16, borderTopWidth: 1, borderTopColor: colors.offWhite, backgroundColor: colors.mainBtn },
    nextTitle: { color: colors.offWhite, fontWeight: "700" },
    nextCat: { color: colors.offWhite, fontWeight: "900", fontSize: 16, marginTop: 4 },
    roundControls: { flexDirection: "row", justifyContent: "center", gap: 12, padding: 12 },
    roundBtn: {
        minWidth: 90,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.mainBtn,
    },
    roundBtnText: { color: colors.offWhite, fontWeight: "800" },
});
