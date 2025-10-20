// src/screens/Timer/SkillDisplayModal.tsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from "react-native-safe-area-context";
import {BodyText, Header} from "@/theme/T";
import {colors} from "@/theme/theme";
import {type Category, CATEGORY_LABEL} from "@/types/common";
import type {Technique} from "@/types/technique";
import {DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, type TimerConfig} from "@/types/timer";
import {type RoundPlan, SKILL_PLAN_STORE_KEY, type SkillPlanSaved} from "@/types/skillPlan";
import {planBalanced, planSpecialized} from "@/screens/Timer/planner";
import {ExpandableSection} from "@/screens/Skills/ExpandableSection";
import {RadioRow} from "@/screens/Skills/RadioRow";
import {useRepos} from "@/lib/providers/RepoProvider";
import {useAuth} from "@/lib/AuthProvider";
import {useStyle} from "@/lib/providers/StyleProvider";
import {STYLE_TO_CATEGORIES} from "@/types/validation";

type Mode = "balanced" | "specialized";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSaved?: () => void;
};

export default function SkillDisplayModal({ visible, onClose, onSaved }: Props) {
    const { skills } = useRepos();
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const { style: userStyle } = useStyle();

    const [cfg, setCfg] = useState<TimerConfig | null>(null);
    const [mode, setMode] = useState<Mode>("balanced");
    const [focus, setFocus] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);

    // style-scoped categories
    const allowedCats = useMemo<Category[]>(
        () => (userStyle ? STYLE_TO_CATEGORIES[userStyle] : []),
        [userStyle]
    );
    const specializedChoices = useMemo(
        () => allowedCats.map((c) => [c, CATEGORY_LABEL[c]] as [Category, string]),
        [allowedCats]
    );

    // load + hydrate from timer storage when the modal opens
    useEffect(() => {
        if (!visible) return;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(TIMER_STORE_KEY);
                const loaded = raw ? { ...DEFAULT_TIMER_CONFIG, ...JSON.parse(raw) } : DEFAULT_TIMER_CONFIG;
                setCfg(loaded);
                setMode((loaded.skillMode as Mode) ?? "balanced");
                setFocus(loaded.specializedCategory ?? null);
            } catch {
                setCfg(DEFAULT_TIMER_CONFIG);
            }
        })();
    }, [visible]);

    const saveCfgPatch = useCallback((patch: Partial<TimerConfig>) => {
        setCfg((prev) => {
            const nextCfg = { ...(prev ?? DEFAULT_TIMER_CONFIG), ...patch };
            AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(nextCfg)).catch(() => {});
            return nextCfg;
        });
    }, []);

    const onPickMode = (m: Mode) => {
        setMode(m);
        saveCfgPatch({ skillMode: m });
    };
    const onPickFocus = (c: Category) => {
        setFocus(c);
        saveCfgPatch({ specializedCategory: c });
    };

    // fetch techniques for only the style-allowed categories
    const loadGroups = useCallback(async (): Promise<Record<Category, Technique[]>> => {
        const out: Record<Category, Technique[]> = {} as any;
        if (!userId || allowedCats.length === 0) return out;
        for (const c of allowedCats) {
            try {
                const rows = await skills.listUserTechniques(userId, c);
                if (rows?.length) out[c] = rows;
            } catch {}
        }
        return out;
    }, [skills, userId, allowedCats]);

    const onSave = useCallback(async () => {
        if (!userStyle) {
            Alert.alert("Choose Your Style", "Please select your boxing style first so we can show only the right categories.");
            return;
        }
        if (mode === "specialized" && (!focus || !allowedCats.includes(focus))) {
            Alert.alert("Specialized", "Pick a category in your style to focus on.");
            return;
        }

        try {
            setLoading(true);
            const rounds = Math.max(1, cfg?.rounds ?? DEFAULT_TIMER_CONFIG.rounds);
            const groups = await loadGroups();

            const nonEmpty: Record<Category, Technique[]> = {} as any;
            for (const k of Object.keys(groups) as Category[]) {
                if ((groups[k]?.length ?? 0) > 0) nonEmpty[k] = groups[k];
            }

            const plans: RoundPlan[] =
                mode === "specialized" && focus
                    ? planSpecialized(rounds, nonEmpty as any, focus, 0.7)
                    : planBalanced(rounds, nonEmpty as any);

            const blob: SkillPlanSaved = {
                mode,
                rounds,
                specializedCategory: focus ?? null,
                plans,
                createdAt: Date.now(),
            };
            await AsyncStorage.setItem(SKILL_PLAN_STORE_KEY, JSON.stringify(blob));

            setLoading(false);
            onSaved?.();     // let parent know
            onClose();       // just close the modal (no navigation)
        } catch (e: any) {
            setLoading(false);
            Alert.alert("Skills", e?.message ?? "Failed to save plan");
        }
    }, [allowedCats, cfg?.rounds, focus, loadGroups, mode, onClose, onSaved, userStyle]);

    return (
        <Modal
            animationType="slide"
            visible={visible}
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="SKILL DISPLAY" isModal onClose={onClose} />

                {!userStyle && (
                    <View style={styles.notice}>
                        <BodyText style={styles.noticeText}>
                            Pick your style in Skills first. This screen will then show only those categories.
                        </BodyText>
                    </View>
                )}

                <View style={styles.cards}>
                    {/* BALANCED */}
                    <ExpandableSection
                        id="balanced"
                        title="BALANCED"
                        defaultExpanded
                        isStyleCard={false}
                        showRadio={false}
                        selected={mode === "balanced"}     // border color via your cardSelected style
                    >
                        <BodyText style={styles.help}>
                            All your skills are evenly distributed by category to help you sharpen your skills all around.
                        </BodyText>
                        <View style={styles.centerRadioBox}>
                            <RadioRow
                                label="SELECTED"
                                value={"balanced" as any}
                                selected={mode as any}
                                onSelect={() => onPickMode("balanced")}
                            />
                        </View>
                    </ExpandableSection>

                    {/* SPECIALIZED */}
                    <ExpandableSection
                        id="specialized"
                        title="SPECIALIZED"
                        defaultExpanded
                        isStyleCard={false}
                        showRadio={false}
                        selected={mode === "specialized"}  // border color via your cardSelected style
                    >
                        <BodyText style={styles.help}>
                            Select a category to focus on. Those skills will be shown about seventy percent of the workout.
                        </BodyText>

                        <View style={{ marginTop: 3 }}>
                            {specializedChoices.map(([cat, label]) => (
                                <RadioRow
                                    key={cat}
                                    label={label}
                                    value={cat as any}
                                    selected={focus as any}
                                    onSelect={(v: any) => onPickFocus(v as Category)}
                                />
                            ))}
                            {specializedChoices.length === 0 && (
                                <BodyText style={{ color: colors.offWhite, opacity: 0.8 }}>
                                    {userStyle
                                        ? "Add techniques to your style’s categories to enable planning."
                                        : "Select your style to choose a focus category."}
                                </BodyText>
                            )}
                        </View>

                        <View style={[styles.centerRadioBox, { marginTop: 10 }]}>
                            <RadioRow
                                label="SELECTED"
                                value={"specialized" as any}
                                selected={mode as any}
                                onSelect={() => onPickMode("specialized")}
                            />
                        </View>
                    </ExpandableSection>
                </View>

                {/* your styled SAVE button (unchanged look) */}
                <View style={styles.saveWrap}>
                    <Pressable
                        onPress={onSave}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.saveBtn,
                            { backgroundColor: colors.text, opacity: pressed ? 0.7 : 1 },
                        ]}
                    >
                        {loading
                            ? <ActivityIndicator color={colors.background} />
                            : <BodyText style={styles.saveText}>SAVE</BodyText>
                        }
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    cards: { paddingHorizontal: 12, gap: 3, marginTop: 6 },
    help: { color: colors.offWhite, opacity: 0.9, marginBottom: 8 },
    centerRadioBox: {
        marginTop: 6,
        borderWidth: 2,
        borderColor: colors.offWhite,
        borderRadius: 10,
        alignItems: "center",
    },
    saveWrap: { padding: 16 },
    saveBtn: {
        height: 72,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    saveText: { fontWeight: "600", fontSize: 20, letterSpacing: 0.5 },
    notice: {
        marginHorizontal: 12,
        marginTop: 8,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.offWhite,
        backgroundColor: colors.mainBtn,
    },
    noticeText: { color: colors.offWhite, opacity: 0.95 },
});
