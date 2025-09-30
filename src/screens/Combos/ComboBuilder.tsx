// src/screens/Combos/ComboBuilder.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    type PanResponderInstance,
    View,
    StyleSheet,
} from "react-native";
import { BodyText } from "@/theme/T";
import MovementPalette from "@/screens/Combos/MovementPalette";
import { Movement, MOVEMENT_LABEL } from "@/types/common";

type Props = {
    palette?: Movement[];
    steps: Movement[];
    insertAt: (m: Movement, at: number) => Promise<void>;
    moveTo: (from: number, to: number) => Promise<void>;
};

const SLOT_H = 48;
const MOVE_THRESHOLD = 4;

export default function ComboBuilder({ steps, insertAt }: Props) {
    // --- measure timeline rect (page coordinates) ---
    const timelineRef = useRef<View | null>(null);
    const [timelineRect, setRect] = useState<{ y: number; h: number }>({ y: 0, h: 0 });

    const measureTimeline = () => {
        // Use requestAnimationFrame to ensure layout is settled before measure
        requestAnimationFrame(() => {
            timelineRef.current?.measure?.((_x, _y, _w, h, _px, py) => {
                setRect({ y: py ?? 0, h: h ?? 0 });
            });
        });
    };

    // --- slot math ---
    const insideTimeline = (y: number) => y >= timelineRect.y && y <= timelineRect.y + timelineRect.h;

    const nearestSlot = useCallback(
        (y: number) => {
            let idx = steps.length; // default: append to end if anywhere inside body
            if (insideTimeline(y)) {
                const mids = Array.from({ length: steps.length + 1 }, (_, i) => timelineRect.y + i * SLOT_H + SLOT_H / 2);
                let best = 0;
                let dist = Infinity;
                for (let i = 0; i < mids.length; i++) {
                    const d = Math.abs(mids[i] - y);
                    if (d < dist) { dist = d; best = i; }
                }
                idx = best;
            }
            return idx;
        },
        [steps.length, timelineRect.y, timelineRect.h]
    );

    // --- drag state ---
    const ghostX = useRef(new Animated.Value(0)).current;
    const ghostY = useRef(new Animated.Value(0)).current;
    const [dragging, setDragging] = useState<Movement | null>(null);
    const [insertIndex, setInsertIndex] = useState(-1);
    const lastIndexRef = useRef(-1);

    const updateIndex = useCallback((y: number) => {
        const next = nearestSlot(y);
        if (next !== lastIndexRef.current) {
            lastIndexRef.current = next;
            setInsertIndex(next);
        }
    }, [nearestSlot]);

    // keep latest insertAt to avoid stale closure in cached responders
    const insertAtRef = useRef(insertAt);
    useEffect(() => { insertAtRef.current = insertAt; }, [insertAt]);

    // --- cache a PanResponder per movement so props stay stable ---
    const respondersRef = useRef<Map<Movement, PanResponderInstance>>(new Map());

    const getResponder = useCallback(
        (m: Movement): PanResponderInstance => {
            const cached = respondersRef.current.get(m);
            if (cached) return cached;

            const r = PanResponder.create({
                // Let the palette's FlatList handle horizontal swipe unless the user clearly moves
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_e, g) =>
                    Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,

                onPanResponderGrant: (_e, g) => {
                    setDragging(m);
                    // Center the ghost roughly under the finger; keep offsets consistent
                    ghostX.setValue((g.moveX ?? 0) - 24);
                    ghostY.setValue((g.moveY ?? 0) - 24);
                },

                onPanResponderMove: (_evt, g) => {
                    // Simple & reliable for MVP; can swap to Animated.event later
                    ghostX.setValue((g.moveX ?? 0) - 24);
                    ghostY.setValue((g.moveY ?? 0) - 24);
                    updateIndex(g.moveY ?? 0);
                },

                onPanResponderRelease: async (_e, g) => {
                    const idx = insideTimeline(g.moveY ?? 0) ? nearestSlot(g.moveY ?? 0) : -1;
                    setDragging(null);
                    setInsertIndex(-1);
                    lastIndexRef.current = -1;
                    if (idx >= 0) await insertAtRef.current(m, idx);
                },

                onPanResponderTerminate: () => {
                    setDragging(null);
                    setInsertIndex(-1);
                    lastIndexRef.current = -1;
                },
            });

            respondersRef.current.set(m, r);
            return r;
        },
        [ghostX, ghostY, nearestSlot, updateIndex]
    );

    const getPanHandlers = useCallback(
        (m: Movement) => getResponder(m).panHandlers as Record<string, unknown>,
        [getResponder]
    );

    return (
        <View style={S.root}>
            {/* 1) Swipable palette with wrapped chips and NO vertical scroll */}
            <MovementPalette
                getPanHandlers={getPanHandlers}
                // onPressChip: optional — keep empty to avoid accidental taps during drag
                onPressChip={undefined}
                rows={3}
                chipMinWidth={96}
                chipGap={8}
                contentPadding={12}
            />

            {/* 2) Timeline drop zone */}
            <View
                ref={timelineRef}
                onLayout={measureTimeline}
                collapsable={false}
                style={S.timeline}
                accessibilityRole="adjustable"
                accessibilityLabel="Combo timeline. Drag here to add. Hover between moves to insert."
            >
                {steps.map((m, i) => (
                    <View key={`${m}-${i}`} style={[S.row, { height: SLOT_H }]}>
                        <BodyText>{MOVEMENT_LABEL[m]}</BodyText>
                    </View>
                ))}

                {insertIndex >= 0 && (
                    <View pointerEvents="none" style={[S.cursor, { top: insertIndex * SLOT_H }]} />
                )}
            </View>

            {/* 3) Floating ghost (never steals touches) */}
            {dragging && (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        transform: [{ translateX: ghostX }, { translateY: ghostY }],
                    }}
                >
                    <View style={S.ghost}>
                        <BodyText>{MOVEMENT_LABEL[dragging]}</BodyText>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    root: { flex: 1 },
    timeline: {
        marginTop: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
    },
    row: {
        justifyContent: "center",
        borderRadius: 10,
        marginBottom: 4,
    },
    cursor: {
        position: "absolute",
        left: 12,
        right: 12,
        height: 2,
        backgroundColor: "#fff",
    },
    ghost: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: "#ccf",
    },
});
