import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import {
    Droppable,
    Draggable,
    DraggableGrid,
    type DraggableGridProps,
} from "@mgcrea/react-native-dnd";
import { MOVEMENT_LABEL, type Movement } from "@/types/common";
import { CHIP_H, CHIP_W, GAP_X } from "./ui";

type Props = {
    steps: Movement[];
    onReorder: (next: Movement[]) => void;
};

export default function ComboTimelineGrid({ steps, onReorder }: Props) {
    const { width } = useWindowDimensions();
    const pad = 16;
    const usable = Math.max(0, width - pad * 2);
    const cols = Math.max(1, Math.floor((usable + GAP_X) / (CHIP_W + GAP_X)));

    const data = useMemo(
        () => steps.map((mv, i) => ({ id: `${i}-${mv}`, mv })), // ids must be strings
        [steps]
    );

    const idToMove = useMemo(
        () => new Map<string, Movement>(data.map(d => [d.id, d.mv] as const)),
        [data]
    );

    const handleOrderChange: DraggableGridProps["onOrderChange"] = (orderIds) => {
        const next = orderIds.map((id) => idToMove.get(String(id))!).filter(Boolean);
        onReorder(next);
    };

    return (
        <View style={[S.wrap, { padding: pad }]}>
            <Text style={S.title}>YOUR COMBO</Text>
            {/* The whole timeline is a droppable target for palette drags */}
            <Droppable id="timeline-drop" style={S.dropArea}>
                <DraggableGrid direction="row" size={cols} gap={GAP_X} style={S.grid} onOrderChange={handleOrderChange}>
                    {data.map((item) => (
                        <Draggable key={item.id} id={item.id} style={S.chip}>
                            <Text style={S.chipText}>{MOVEMENT_LABEL[item.mv]}</Text>
                        </Draggable>
                    ))}
                </DraggableGrid>
            </Droppable>
        </View>
    );
}

const S = StyleSheet.create({
    wrap: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, marginTop: 12 },
    title: { color: "#cbd5e1", fontWeight: "700", marginBottom: 8 },
    dropArea: { borderRadius: 12 },
    grid: {},
    chip: {
        height: 44,
        minWidth: 108,
        borderRadius: 18,
        paddingHorizontal: 12,
        justifyContent: "center",
        backgroundColor: "#1f2937",
    },
    chipText: { color: "#fff" },
});
