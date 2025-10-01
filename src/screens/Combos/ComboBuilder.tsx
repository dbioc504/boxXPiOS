import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    type PanResponderInstance,
    View,
    StyleSheet,
    Text,
} from "react-native";
import { BodyText } from "@/theme/T";
import MovementPalette from "@/screens/Combos/MovementPalette";
import { Movement, MOVEMENT_LABEL } from "@/types/common";
import { CHIP_W, CHIP_H, GAP_X, GAP_Y, TIMELINE_PAD, INSERT_TOL, calCols } from "./ui";

type Props = {
    steps: Movement[];
    insertAt: (m: Movement, at: number) => Promise<void>;
    moveTo: (from: number, to: number) => Promise<void>;
};

const MOVE_THRESHOLD = 2;

export default function ComboBuilder({ steps, insertAt, moveTo }: Props) {
    // timeline measure
    const timelineRef = useRef<View | null>(null);
    const [tlRect, setTlRect] = useState<{ left: number; top: number; width: number; height: number; cols: number }>({
        left: 0, top: 0, width: 0, height: 0, cols: 1,
    });

    const measureTimeline = () => {
        requestAnimationFrame(() => {
            timelineRef.current?.measure?.((x, y, w, h, px, py) => {
                const left = (px ?? 0) + TIMELINE_PAD;
                const top  = (py ?? 0) + TIMELINE_PAD;
                const innerW = (w ?? 0) - TIMELINE_PAD * 2;
                const cols = calCols(w ?? 0);
                setTlRect({ left, top, width: innerW, height: (h ?? 0) - TIMELINE_PAD * 2, cols });
            });
        });
    };

    // --- point -> index (left->right, top->down)
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const pointToIndex = useCallback((pageX: number, pageY: number) => {
        const { left, top, width, cols } = tlRect;
        if (width <= 0 || cols <= 0) return -1;

        // Overscan a bit so near-misses still count
        const overscan = 12;
        if (pageX < left - overscan || pageX > left + width + overscan) return -1;

        const lx = clamp(pageX - left, 0, width);
        const ly = Math.max(0, pageY - top);

        const row = Math.max(0, Math.floor(ly / (CHIP_H + GAP_Y)));
        // slightly biased to centers so it feels sticky
        const col = clamp(Math.floor((lx + GAP_X / 2) / (CHIP_W + GAP_X)), 0, cols - 1);

        let idx = row * cols + col;
        // limit: you can insert at most at steps.length (append)
        if (idx > steps.length) idx = steps.length;
        return idx;
    }, [tlRect, steps.length]);

    // --- drag state (ghost + insert cursor)
    const ghostX = useRef(new Animated.Value(0)).current;
    const ghostY = useRef(new Animated.Value(0)).current;
    const [dragging, setDragging] = useState<Movement | null>(null);
    const [insertIndex, setInsertIndex] = useState(-1);
    const lastIndexRef = useRef(-1);

    // keep finger-to-chip offset so ghost follows the finger exactly
    const touchOffset = useRef({ x: CHIP_W / 2, y: CHIP_H / 2 });

    // rAF throttle for index updates (smooth, no jitter)
    const rafRef = useRef<number | null>(null);
    const scheduleIndexUpdate = (pageX: number, pageY: number) => {
        if (rafRef.current != null) return;
        const px = pageX, py = pageY;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const idx = pointToIndex(px, py);
            // small "tolerance" — only change when we move past centers by INSERT_TOL
            if (idx !== lastIndexRef.current) {
                lastIndexRef.current = idx;
                setInsertIndex(idx);
            }
        });
    };

    // keep latest callbacks
    const insertAtRef = useRef(insertAt);
    const moveToRef = useRef(moveTo);
    useEffect(() => { insertAtRef.current = insertAt; }, [insertAt]);
    useEffect(() => { moveToRef.current = moveTo; }, [moveTo]);

    // --- PanResponders

    // chips from PALETTE -> timeline
    const paletteResponders = useRef<Map<Movement, PanResponderInstance>>(new Map());
    const getPaletteResponder = useCallback((m: Movement): PanResponderInstance => {
        const cached = paletteResponders.current.get(m);
        if (cached) return cached;

        const r = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,
            onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,

            onPanResponderGrant: (evt, _g) => {
                const n = (evt as any).nativeEvent;
                touchOffset.current = { x: n.locationX ?? CHIP_W / 2, y: n.locationY ?? CHIP_H / 2 };
                setDragging(m);
                ghostX.setValue((n.pageX ?? 0) - touchOffset.current.x);
                ghostY.setValue((n.pageY ?? 0) - touchOffset.current.y);
            },
            onPanResponderMove: (evt, _g) => {
                const n = (evt as any).nativeEvent;
                const px = n.pageX ?? 0, py = n.pageY ?? 0;
                ghostX.setValue(px - touchOffset.current.x);
                ghostY.setValue(py - touchOffset.current.y);
                scheduleIndexUpdate(px, py);
            },
            onPanResponderRelease: async (evt, _g) => {
                const n = (evt as any).nativeEvent;
                const idx = pointToIndex(n.pageX ?? 0, n.pageY ?? 0);
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1;
                if (idx >= 0) await insertAtRef.current(m, idx);
            },
            onPanResponderTerminate: () => {
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1;
            },
        });

        paletteResponders.current.set(m, r);
        return r;
    }, [ghostX, ghostY, pointToIndex]);

    const getPanHandlers = useCallback(
        (m: Movement) => getPaletteResponder(m).panHandlers as Record<string, unknown>,
        [getPaletteResponder]
    );

    // chips from TIMELINE -> reorder
    const timelineResponders = useRef<Map<string, PanResponderInstance>>(new Map());
    const fromIndexRef = useRef<number | null>(null);

    const getTimelineResponder = useCallback((i: number, m: Movement): PanResponderInstance => {
        const key = `${m}-${i}`;
        const cached = timelineResponders.current.get(key);
        if (cached) return cached;

        const r = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,
            onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,

            onPanResponderGrant: (evt, _g) => {
                const n = (evt as any).nativeEvent;
                fromIndexRef.current = i;
                touchOffset.current = { x: n.locationX ?? CHIP_W / 2, y: n.locationY ?? CHIP_H / 2 };
                setDragging(m);
                ghostX.setValue((n.pageX ?? 0) - touchOffset.current.x);
                ghostY.setValue((n.pageY ?? 0) - touchOffset.current.y);
            },
            onPanResponderMove: (evt, _g) => {
                const n = (evt as any).nativeEvent;
                const px = n.pageX ?? 0, py = n.pageY ?? 0;
                ghostX.setValue(px - touchOffset.current.x);
                ghostY.setValue(py - touchOffset.current.y);
                scheduleIndexUpdate(px, py);
            },
            onPanResponderRelease: async (evt, _g) => {
                const n = (evt as any).nativeEvent;
                const toIdx = pointToIndex(n.pageX ?? 0, n.pageY ?? 0);
                const from = fromIndexRef.current ?? i;
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1; fromIndexRef.current = null;

                if (toIdx >= 0) {
                    let to = toIdx;
                    if (to > from) to = to - 1; // account for the vacated slot when moving forward
                    if (to !== from && to >= 0 && to <= steps.length - 1) {
                        await moveToRef.current(from, to);
                    }
                }
            },
            onPanResponderTerminate: () => {
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1; fromIndexRef.current = null;
            },
        });

        timelineResponders.current.set(key, r);
        return r;
    }, [ghostX, ghostY, pointToIndex, steps.length]);

    // --- render

    // Build the visual list with a placeholder chip at insertIndex
    const renderWithPlaceholder: Array<{ kind: "ph" } | { kind: "mv"; m: Movement; i: number }> = [];
    steps.forEach((m, i) => {
        if (insertIndex === i) renderWithPlaceholder.push({ kind: "ph" });
        renderWithPlaceholder.push({ kind: "mv", m, i });
    });
    if (insertIndex === steps.length) renderWithPlaceholder.push({ kind: "ph" });

    return (
        <View style={S.root}>
            {/* 1) Palette */}
            <MovementPalette
                getPanHandlers={getPanHandlers}
                dragActive={!!dragging}
            />

            {/* 2) Timeline (left->right, wrap) */}
            <View
                ref={timelineRef}
                onLayout={measureTimeline}
                collapsable={false}
                style={S.timeline}
                accessibilityRole="adjustable"
                accessibilityLabel="Combo timeline. Drag here to add. Drag chips to reorder."
            >
                <Text style={S.sectionTitle}>YOUR COMBO:</Text>

                <View style={S.grid}>
                    {renderWithPlaceholder.map((item, idx) => {
                        if (item.kind === "ph") {
                            return (
                                <View
                                    key={`ph-${idx}`}
                                    style={[
                                        S.placeholder,
                                        { width: CHIP_W, height: CHIP_H, marginRight: GAP_X, marginBottom: GAP_Y },
                                    ]}
                                    pointerEvents="none"
                                />
                            );
                        } else {
                            const { m, i } = item;
                            const r = getTimelineResponder(i, m);
                            return (
                                <View
                                    key={`${m}-${i}-${idx}`}
                                    {...r.panHandlers}
                                    style={[
                                        S.chip,
                                        {
                                            width: CHIP_W, height: CHIP_H,
                                            marginRight: GAP_X, marginBottom: GAP_Y,
                                            opacity: dragging && fromIndexRef.current === i ? 0.35 : 1,
                                        },
                                    ]}
                                    accessibilityLabel={`Move ${MOVEMENT_LABEL[m]}`}
                                    accessible
                                >
                                    <BodyText>{MOVEMENT_LABEL[m]}</BodyText>
                                </View>
                            );
                        }
                    })}
                </View>
            </View>

            {/* 3) Floating ghost */}
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
    sectionTitle: {
        color: "#cbd5e1",
        marginBottom: 8,
        fontWeight: "700",
    },
    timeline: {
        marginTop: 16,
        padding: TIMELINE_PAD,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#334155",
        backgroundColor: "rgba(17, 24, 39, 0.5)",
    },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
        borderRadius: 18,
        paddingHorizontal: 12,
        justifyContent: "center",
        backgroundColor: "#1f2937",
    },
    placeholder: {
        borderRadius: 18,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#94a3b8",
        backgroundColor: "rgba(148,163,184,0.15)",
    },
    ghost: {
        width: CHIP_W,
        height: CHIP_H,
        borderRadius: 18,
        paddingHorizontal: 12,
        justifyContent: "center",
        backgroundColor: "#475569",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        transform: [{ scale: 1.03 }],
    },
});
