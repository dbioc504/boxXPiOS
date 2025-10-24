import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {BodyText, Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {type Category, CATEGORY_LABEL} from "@/types/common";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";
import {ComboMeta} from "@/lib/repos/combos.repo";
import {ComboRow} from "@/screens/Combos/ComboRow";
import {COMBO_DISPLAY_STORE_KEY, type ComboDisplaySaved} from "@/types/comboDisplay";
import {useAuth} from "@/lib/AuthProvider";

type Section = {
    title: string;
    key: string;
    data: ComboMeta[];
};

const NO_CAT_KEY = "NO_CATEGORY";

export default function ComboDisplayScreen() {
    const nav = useNavigation();
    const repo = useCombosRepo();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id;

    const [combos, setCombos] = useState<ComboMeta[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(COMBO_DISPLAY_STORE_KEY);
                if (raw) {
                    const prev = JSON.parse(raw) as ComboDisplaySaved;
                    setSelectedIds(new Set(prev.selectedIds));
                }
            } catch {}
        })();
    }, []);

    const load = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const list = await repo.listCombos();
            setCombos(list);
        } finally {
            setLoading(false);
        }
    }, [repo, userId]);

    useEffect(() => { if (userId) load(); }, [userId, load]);

    const sections = useMemo<Section[]>(() => {
        const byCat = new Map<string, ComboMeta[]>();
        for (const c of combos) {
            const k = c.category ?? NO_CAT_KEY;
            const arr = byCat.get(k) ?? [];
            arr.push(c);
            byCat.set(k, arr);
        }

        const makeTitle = (k: string) =>
            k === NO_CAT_KEY ? "No Category" : CATEGORY_LABEL[k as Category] ?? "Unknown";

        const known = [...byCat.keys()]
            .filter((k) => k !== NO_CAT_KEY)
            .sort((a, b) => makeTitle(a).localeCompare(makeTitle(b)));

        const order = [...known, ...(byCat.has(NO_CAT_KEY) ? [NO_CAT_KEY] : [])];

        return order.map((k: string) => ({
            title: makeTitle(k),
            key: k,
            data: byCat.get(k) ?? [],
        }));
    }, [combos]);

    useEffect(() => {
        setExpandedIds(prev => {
            const allowed = new Set(combos.map((c) => c.id));
            let changed = false;

            const next = new Set<string>();
            prev.forEach((id) => {
                if (allowed.has(id)) {
                    next.add(id);
                } else {
                    changed = true;
                }
            });

            return changed ? next : prev;
        });
    }, [combos]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const onSave = useCallback(async () => {
        try {
            setSaving(true);
            const payload: ComboDisplaySaved = {
                selectedIds: Array.from(selectedIds),
                createdAt: Date.now(),
            };
            await AsyncStorage.setItem(COMBO_DISPLAY_STORE_KEY, JSON.stringify(payload));
            setSaving(false);
            nav.goBack();
        } catch (e) {
            setSaving(false);
        }
    }, [nav, selectedIds]);

    if (authLoading || loading) {
        return (
            <SafeAreaView style={sharedStyle.safeArea}>
                <Header title="COMBO DISPLAY"/>
                <View style={{ padding: 16 }}>
                    <ActivityIndicator color={colors.offWhite} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="COMBO DISPLAY"/>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 8, gap: 8 }}
                renderSectionHeader={({ section }) => (
                    <View style={S.sectionHeader}>
                        <Text style={S.sectionText}>{section.title}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <ComboRow
                        meta={item}
                        userId={userId!}
                        expanded={expandedIds.has(item.id)}
                        onToggle={toggleExpand}
                        selectMode
                        selected={selectedIds.has(item.id)}
                        onSelectToggle={toggleSelect}
                    />
                )}
            />

            <View style={S.saveWrap}>
                <Pressable
                    onPress={onSave}
                    disabled={saving}
                    style={({ pressed }) => [
                        S.saveBtn,
                        { backgroundColor: colors.text, opacity: pressed ? 0.7 : 1 }
                    ]}
                >
                    {saving
                        ? <ActivityIndicator color={colors.background}/>
                        : <BodyText style={S.saveText}>SAVE</BodyText>
                    }
                </Pressable>
            </View>
        </SafeAreaView>
    );
}


const S = StyleSheet.create({
    sectionHeader: {
        marginTop: 6,
        marginBottom: 2,
        paddingHorizontal: 8,
    },
    sectionText: {
        color: colors.offWhite,
        fontWeight: '700',
        fontSize: 16,
        opacity: 0.95,
    },
    saveWrap: { padding: 16 },
    saveBtn: {
        height: 72,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    saveText: { fontWeight: "600", fontSize: 20, letterSpacing: 0.5 },
});
