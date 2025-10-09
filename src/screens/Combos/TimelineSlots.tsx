// TimelineSlots.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Droppable } from "@/screens/Combos/DndComponents/Droppable";
import { Draggable } from "@/screens/Combos/DndComponents/Draggable";
import type { Movement } from "@/types/common";
import { MOVEMENT_LABEL } from "@/types/common";

type Props = {
    steps: Movement[];
};

export function TimelineSlots({ steps }: Props) {
    return (
        <View style={S.wrap}>
            <Text style={S.title}>YOUR COMBO</Text>
            <View style={S.row}>
                {Array.from({ length: steps.length + 1 }).map((_, i) => (
                    <React.Fragment key={`frag-${i}`}>
                        {/* slot-i: insert point */}
                        <Droppable
                            key={`slot-${i}`}
                            id={`slot-${i}`}
                            edgeOnly={i === 0 || i === steps.length}
                            style={S.slot}
                            overBorderColor="#4b6cff"
                            idleBorderColor="#334155"
                            overBg="rgba(75,108,255,0.25)"
                            idleBg="rgba(15,23,42,0.13)"
                        >
                            <Text style={S.slotPlus}>+</Text>
                        </Droppable>

                        {/* chip-i: actual step (if exists) */}
                        {i < steps.length && (
                            <Draggable
                                key={`chip-${i}-${steps[i]}`}          // 👈 add this
                                id={`chip-${i}`}
                                style={S.chip}
                            >
                                <Text style={S.chipText}>{MOVEMENT_LABEL[steps[i]]}</Text>
                            </Draggable>
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    wrap: { padding: 12, gap: 12 },
    title: { fontSize: 16, fontWeight: "700", color: "#eef" },
    row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
    slot: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    slotPlus: { color: "#cbd5e1", fontSize: 20, fontWeight: "700" },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#8e8af7" },
    chipText: { color: "#0b0b2a", fontWeight: "600" },
});
