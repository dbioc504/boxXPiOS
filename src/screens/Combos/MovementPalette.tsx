// MovementPalette.tsx
import React, {useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {BODY_PUNCHES, DEFENSES, type Movement, MOVEMENT_LABEL, PUNCHES} from "@/types/common";
import {CHIP_H, CHIP_W} from "@/screens/Combos/ui";
import {DnDDraggable} from "@/screens/Combos/DnDPrimitives";

const GROUPS = [
    { key: "punches", title: "PUNCHES", items: PUNCHES as Movement[] },
    { key: "body", title: "BODY PUNCHES", items: BODY_PUNCHES as Movement[] },
    { key: "defense", title: "DEFENSE", items: DEFENSES as Movement[] },
] as const;

export type MovementPaletteProps = { onPressChip?: (m: Movement) => void };

export function MovementPalette({ onPressChip }: MovementPaletteProps) {
    const [pageIndex, setPageIndex] = useState(0);
    const page = GROUPS[pageIndex];
    const [tabWidth, setTabWidth] = useState<number | undefined>(undefined);

    return (
        <View style={S.container}>
            {/* Shared content frame */}
            <View style={S.content}>
                <View style={S.tabs} accessibilityRole="tablist"
                      onLayout={(e) => setTabWidth(e.nativeEvent.layout.width)}>
                    {GROUPS.map((g, i) => {
                        const active = i === pageIndex;
                        return (
                            <Pressable key={g.key} onPress={() => setPageIndex(i)} style={[S.tab, active && S.tabActive]}>
                                <Text style={[S.tabText, active && S.tabTextActive]}>{g.title}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={S.grid}>
                    {page.items.map((m) => (
                        <DnDDraggable
                            key={m}
                            id={`mv-${m}`}
                            data={{ movement: m }}
                            animatedStyleWorklet={(s, isActive) => {
                                'worklet';
                                return {
                                    ...s,
                                    zIndex: isActive ? 999 : 0,
                                    transform: [{ scale: isActive ? 1.02 : 1 }]
                                };
                            }}
                        >
                            <Pressable
                                onPress={() => onPressChip?.(m)}
                                style={S.chip}
                                accessible
                                accessibilityLabel={MOVEMENT_LABEL[m]}
                            >
                                <Text style={S.chipText}>{MOVEMENT_LABEL[m]}</Text>
                            </Pressable>
                        </DnDDraggable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: 'stretch',
        marginBottom: 40
    },

    // One frame for both tabs and grid
    content: {
        width: "100%",
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        alignContent: 'stretch'
    },

    tabs: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingBottom: 8,
    },
    tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#2a2a2a",
            height: 40, justifyContent: 'center', marginBottom: 4},
    tabActive: { backgroundColor: "#4b6cff" },
    tabText: { color: "#ddd", fontSize: 14 },
    tabTextActive: { color: "#fff", fontWeight: "600" },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: 'space-between',
        alignContent: 'stretch'
    },

    chip: {
        width: CHIP_W,
        height: CHIP_H,
        borderRadius: 16,
        backgroundColor: "#8e8af7",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    chipText: { color: "#0b0b2a", fontSize: 12.5, fontWeight: "600", textAlign: "center" },
});
