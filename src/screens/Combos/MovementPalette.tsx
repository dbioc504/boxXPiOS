import React, {useState} from "react";
import {Pressable, StyleSheet, Text, View,} from "react-native";
import {Draggable} from "@mgcrea/react-native-dnd";
import {BODY_PUNCHES, DEFENSES, type Movement, MOVEMENT_LABEL, PUNCHES,} from "@/types/common";
import {CHIP_H, CHIP_W, GAP_X, GAP_Y} from "@/screens/Combos/ui";

const GROUPS = [
    { key: "punches", title: "PUNCHES", items: PUNCHES as Movement[] },
    { key: "body",    title: "BODY PUNCHES",    items: BODY_PUNCHES as Movement[] },
    { key: "defense", title: "DEFENSE", items: DEFENSES as Movement[] },
] as const;

export type MovementPaletteProps = {
    onPressChip?: (m: Movement) => void;
};

export function MovementPalette({ onPressChip }: MovementPaletteProps) {
    const [pageIndex, setPageIndex] = useState(0);
    const page = GROUPS[pageIndex];

    return (
        <View style={S.container}>
            <View style={S.tabs} accessibilityRole='tablist'>
                {GROUPS.map((g,i) => {
                    const active = i === pageIndex;
                    return (
                        <Pressable key={g.key} onPress={() => setPageIndex(i)} style={[S.tab, active && S.tabActive]}>
                            <Text style={[S.tabText, active && S.tabTextActive]}>{g.title}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={S.page}>
                <View style={S.grid}>
                    {page.items.map(m => (
                        <Draggable key={m} id={`mv-${m}`} data={{ movement: m }}>
                            <Pressable
                                onPress={() => onPressChip?.(m)}
                                style={[
                                    S.chip,
                                    { width: CHIP_W, height: CHIP_H, marginRight: GAP_X, marginBottom: GAP_Y }
                                ]}
                                accessible
                                accessibilityLabel={MOVEMENT_LABEL[m]}
                            >
                                <Text style={S.chipText}>{MOVEMENT_LABEL[m]}</Text>
                            </Pressable>
                        </Draggable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    container: { width: "100%", alignContent: 'center', alignItems: 'center' },
    page: { width: '100%', paddingTop: 10, paddingBottom: 8, alignItems: "center"},
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 8,
        gap: 8,
        justifyContent: "center",
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#2a2a2a",
    },
    tabActive: { backgroundColor: "#4b6cff" },
    tabText: { color: "#ddd", fontSize: 14 },
    tabTextActive: { color: "#fff", fontWeight: "600" },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },
    grid: { flexDirection: "row", flexWrap: "wrap", alignContent: 'center' },
    chip: { borderRadius: 16, backgroundColor: "#8e8af7", justifyContent: "center", paddingHorizontal: 12 },
    chipText: { color: "#0b0b2a", fontSize: 12.5, fontWeight: "600", textAlign: 'left' },
});