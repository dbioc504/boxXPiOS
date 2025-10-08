// TimelineSlotsPlayground.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { DndProvider, useDnd } from "@/screens/Combos/DndComponents/DndProvider";
import { TimelineSlots } from "./TimelineSlots";
import type { Movement } from "@/types/common";

// simple move helper
function move<T>(arr: T[], from: number, to: number): T[] {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

// parse ids safely
const parseChipIndex = (id: string | null | undefined) =>
    id && id.startsWith("chip-") ? Number(id.slice(5)) : null;

const parseSlotIndex = (id: string | null | undefined) =>
    id && id.startsWith("slot-") ? Number(id.slice(5)) : null;

// Listener that converts shared drop events into React updates
function DropListener({ onReorder }: { onReorder: (from: number, to: number) => void }) {
    const { dropSeq, dropDragId, dropOverId } = useDnd();
    const lastSeq = useRef(-1);

    useEffect(() => {
        let alive = true;
        const interval = setInterval(() => {
            if (!alive) return;
            const seq = dropSeq.value;
            if (seq !== lastSeq.current) {
                lastSeq.current = seq;

                const from = parseChipIndex(dropDragId.value);
                const to = parseSlotIndex(dropOverId.value);

                if (from != null && to != null) {
                    onReorder(from, to);
                }
            }
        }, 33);
        return () => {
            alive = false;
            clearInterval(interval);
        };
    }, [dropSeq, dropDragId, dropOverId, onReorder]);

    return null;
}

export default function TimelineSlotsPlayground() {
    // seed with a tiny set to reorder
    const initial: Movement[] = useMemo(
        () => ["jab", "straight", "left_hook"] as Movement[],
        []
    );

    const [steps, setSteps] = useState<Movement[]>(initial);

    return (
        <DndProvider>
            <DropListener onReorder={(from, to) => setSteps((cur) => move(cur, from, to))} />

            <View style={S.root}>
                <TimelineSlots steps={steps} />
                <Text style={S.hint}>Drag a chip and drop on a + slot to reorder</Text>
                <Text style={S.state}>Steps: {steps.join(" · ")}</Text>
            </View>
        </DndProvider>
    );
}

const S = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0b0b2a", paddingTop: 40 },
    hint: { color: "#bcd", textAlign: "center", marginTop: 8 },
    state: { color: "#9ab", textAlign: "center", marginTop: 4, fontSize: 12 },
});
