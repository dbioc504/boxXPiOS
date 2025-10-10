// TimelineSlotsPlayground.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { DndProvider, useDnd } from "@/screens/Combos/DndComponents/DndProvider";
import { TimelineSlots } from "./TimelineSlots";
import type { Movement } from "@/types/common";
import {useSwapPreview} from "@/lib/hooks/useSwapPreview";

// simple move helper
function move<T>(arr: T[], from: number, to: number): T[] {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

// parse ids safely
const parseChipIndex = (id: string | null | undefined) => {
    if (!id || !id.startsWith("chip-")) return null;
    const n = Number(id.slice(5));
    return Number.isFinite(n) ? n : null;
};

const parseSlotIndex = (id: string | null | undefined) => {
    if (!id || !id.startsWith("slot-")) return null;
    const n = Number(id.slice(5));
    return Number.isFinite(n) ? n : null;
};

function swap<T>(arr: T[], a: number, b: number): T[] {
    if (a === b || a == null || b == null) return arr;
    const next = arr.slice();
    [next[a], next[b]] = [next[b], next[a]];
    return next;
}

// Listener that converts shared drop events into React updates
function DropListener({
    stepsLen,
    onReorder,
    onSwap
}: {
    stepsLen: number;
    onReorder: (from: number, to: number) => void;
    onSwap: (a: number, b: number) => void;
}) {
    const { dropSeq, dropDragId, dropOverId } = useDnd();
    const lastSeq = useRef(-1);

    useEffect(() => {
        let alive = true;
        const interval = setInterval(() => {
            if (!alive) return;
            const seq = dropSeq.value;
            if (seq !== lastSeq.current) {
                lastSeq.current = seq;

                const fromChip = parseChipIndex(dropDragId.value);
                const overChip = parseChipIndex(dropOverId.value);
                const overSlot = parseSlotIndex(dropOverId.value);
                const inRange = (n: number | null, len: number) =>
                    n != null && n >= 0 && n < len;

                if (inRange(fromChip, stepsLen) && inRange(overChip, stepsLen)) {
                    onSwap(fromChip!, overChip!);
                } else if (inRange(fromChip, stepsLen) && overSlot != null) {
                    if (overSlot === 0 || overSlot === stepsLen) {
                        onReorder(fromChip!, overSlot);
                    }
                }
            }
        }, 33);
        return () => {
            alive = false;
            clearInterval(interval);
        };
    }, [dropSeq, dropDragId, dropOverId, stepsLen, onReorder, onSwap]);

    return null;
}

function DebugDrop() {
    const { dropDragId, dropOverId, dropSeq } = useDnd();
    const [d, setD] = useState({ drag: '', over: '', seq: 0 });

    useEffect(() => {
        let alive = true;
        const t = setInterval(() => {
            if (!alive) return;
            setD({ drag: String(dropDragId.value ?? ''), over: String(dropOverId.value ?? ''), seq: dropSeq.value });
        }, 100);
        return () => { alive = false; clearInterval(t); };
    }, [dropDragId, dropOverId, dropSeq]);

    return <Text style={{ color: '#8ab', textAlign: 'center', marginTop: 4 }}>
        drop: {d.drag} → {d.over} (#{d.seq})
    </Text>;
}

function TimelineWithPreview({ steps }: { steps: Movement[] }) {
// ✅ This is a descendant of <DndProvider/>, so hooks that use context are safe here
    const { fromIndex, overIndex, targetIsChip } = useSwapPreview();
    return (
        <TimelineSlots
            steps={steps}
            previewFromIndex={fromIndex}
            previewOverIndex={overIndex}
            previewTargetIsChip={targetIsChip}
        />
    );
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
            <DropListener
                stepsLen={steps.length}
                onReorder={(from, to) => setSteps((cur) => move(cur, from, to))}
                onSwap={(a,b) => setSteps(cur => swap(cur, a, b))}
            />

            <View style={S.root}>
                <TimelineWithPreview steps={steps}/>
                <Text style={S.hint}>Drag a chip over another chip to preview swap</Text>
                <Text style={S.state}>Steps: {steps.join(' · ')}</Text>
            </View>
        </DndProvider>
    );
}

const S = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0b0b2a", paddingTop: 40 },
    hint: { color: "#bcd", textAlign: "center", marginTop: 8 },
    state: { color: "#9ab", textAlign: "center", marginTop: 4, fontSize: 12 },
});
