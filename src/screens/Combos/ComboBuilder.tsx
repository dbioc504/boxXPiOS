// src/screens/Combos/ComboBuilder.tsx
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import MovementPalette from "@/screens/Combos/MovementPalette";
import TimelineSlots from "@/screens/Combos/TimelineSlots";
import type { Movement } from "@/types/common";

type Props = {
    steps: Movement[];
    insertAt: (m: Movement, at: number) => Promise<void>;
    moveTo: (from: number, to: number) => Promise<void>;
};

async function applyReorder(
    current: Movement[],
    next: Movement[],
    moveTo: (from: number, to: number) => Promise<void>
) {
    const arr = [...current];
    for (let i = 0; i < next.length; i++) {
        if (arr[i] === next[i]) continue;
        const from = arr.indexOf(next[i], i);
        if (from !== -1 && from !== i) {
            await moveTo(from, i);
            const [m] = arr.splice(from, 1);
            arr.splice(i, 0, m);
        }
    }
}

export default function ComboBuilder({ steps, insertAt, moveTo }: Props) {
    const onReorder = useCallback(
        async (next: Movement[]) => {
            if (next.length !== steps.length) return;
            await applyReorder(steps, next, moveTo);
        },
        [steps, moveTo]
    );

    const onPressChip = useCallback(
        async (m: Movement) => {
            await insertAt(m, steps.length);
        },
        [insertAt, steps.length]
    );

    return (
        <View style={S.root}>
            <MovementPalette onPressChip={onPressChip} />
            <TimelineSlots steps={steps} onReorder={onReorder} />
        </View>
    );
}

const S = StyleSheet.create({
    root: { flex: 1 },
});
