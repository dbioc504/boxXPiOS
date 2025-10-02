import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    type PanResponderInstance,
    View,
    StyleSheet,
    Text,
    Dimensions,
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

// Toggle this on to see detailed logs
const DEBUG = true;
const dlog = (...args: any[]) => { if (__DEV__ && DEBUG) console.log("[ComboBuilder]", ...args); };

export default function ComboBuilder({ steps, insertAt, moveTo }: Props) {
    // timeline measure (page coords)
    const timelineRef = useRef<View | null>(null);
    const [tlRect, setTlRect] = useState<{ left: number; top: number; width: number; height: number; cols: number }>({
        left: 0, top: 0, width: 0, height: 0, cols: 1,
    });

    const measureTimeline = useCallback(() => {
        requestAnimationFrame(() => {
            // Use measureInWindow for reliable page coords on both iOS/Android
            timelineRef.current?.measureInWindow?.((px, py, w, h) => {
                const fullW = w ?? 0;
                const fullH = h ?? 0;
                const innerLeft = (px ?? 0) + TIMELINE_PAD;
                const innerTop  = (py ?? 0) + TIMELINE_PAD;
                const innerW = Math.max(0, fullW - TIMELINE_PAD * 2);
                const innerH = Math.max(0, fullH - TIMELINE_PAD * 2);
                const cols = calCols(fullW);
                const rect = { left: innerLeft, top: innerTop, width: innerW, height: innerH, cols };
                setTlRect(rect);
                dlog("measured tlRect:", rect);
            });
        });
    }, []);

    // Re-measure on layout, on steps change, and on orientation/size change
    useEffect(() => { measureTimeline(); }, [measureTimeline]);
    useEffect(() => { measureTimeline(); }, [steps.length, measureTimeline]);
    useEffect(() => {
        const sub = Dimensions.addEventListener("change", measureTimeline);
        return () => sub.remove();
    }, [measureTimeline]);

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const inTimeline = useCallback((pageX: number, pageY: number) => {
        const ov = 12;
        const { left, top, width, height } = tlRect;
        const inside =
            pageX >= left - ov &&
            pageX <= left + width + ov &&
            pageY >= top - ov &&
            pageY <= top + height + ov;
        return inside;
    }, [tlRect]);

    // Map finger to candidate index (L->R, T->B), but we’ll default to END unless near a cell center
    const pointToIndex = useCallback((pageX: number, pageY: number) => {
        const { left, top, width, cols } = tlRect;
        if (width <= 0 || cols <= 0) return -1;

        const lx = clamp(pageX - left, 0, width);
        const ly = Math.max(0, pageY - top);

        const row = Math.max(0, Math.floor(ly / (CHIP_H + GAP_Y)));
        const col = clamp(Math.floor((lx + GAP_X / 2) / (CHIP_W + GAP_X)), 0, cols - 1);

        let idx = row * cols + col;
        if (idx > steps.length) idx = steps.length;

        // Center of that cell
        const cx = col * (CHIP_W + GAP_X) + CHIP_W / 2;
        const cy = row * (CHIP_H + GAP_Y) + CHIP_H / 2;

        // Only accept the candidate if finger is reasonably near its center; else we append
        const near =
            Math.abs(lx - cx) <= (CHIP_W / 2 + INSERT_TOL) &&
            Math.abs(ly - cy) <= (CHIP_H / 2 + INSERT_TOL);

        const finalIdx = near ? idx : steps.length;

        dlog("pointToIndex",
            { pageX, pageY, lx, ly, row, col, idx, near, finalIdx, cols, width });

        return finalIdx;
    }, [tlRect, steps.length]);

    // --- drag state (ghost + insert cursor)
    const ghostX = useRef(new Animated.Value(0)).current;
    const ghostY = useRef(new Animated.Value(0)).current;
    const [dragging, setDragging] = useState<Movement | null>(null);
    const [insertIndex, setInsertIndex] = useState(-1);
    const lastIndexRef = useRef(-1);

    // finger-to-chip offset so ghost sits under finger (we’ll start centered)
    const touchOffset = useRef({ x: CHIP_W / 2, y: CHIP_H / 2 });

    // rAF throttle for index updates
    const rafRef = useRef<number | null>(null);
    const scheduleIndexUpdate = (pageX: number, pageY: number) => {
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (!inTimeline(pageX, pageY)) {
                // show end placeholder if outside (feels like “ready to append”)
                if (lastIndexRef.current !== steps.length) {
                    lastIndexRef.current = steps.length;
                    setInsertIndex(steps.length);
                }
                return;
            }
            const idx = pointToIndex(pageX, pageY);
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

    // PALETTE -> timeline
    const paletteResponders = useRef<Map<Movement, PanResponderInstance>>(new Map());
    const getPaletteResponder = useCallback((m: Movement): PanResponderInstance => {
        const cached = paletteResponders.current.get(m);
        if (cached) return cached;

        const r = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,
            onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > MOVE_THRESHOLD || Math.abs(g.dy) > MOVE_THRESHOLD,

            onPanResponderGrant: (_evt, g) => {
                // Use gesture page coords; anchor ghost under finger
                touchOffset.current = { x: CHIP_W / 2, y: CHIP_H / 2 };
                setDragging(m);
                lastIndexRef.current = steps.length;
                setInsertIndex(steps.length);
                ghostX.setValue((g.x0 ?? 0) - touchOffset.current.x);
                ghostY.setValue((g.y0 ?? 0) - touchOffset.current.y);
                dlog("grant palette", { x0: g.x0, y0: g.y0 });
            },
            onPanResponderMove: (_evt, g) => {
                ghostX.setValue((g.moveX ?? 0) - touchOffset.current.x);
                ghostY.setValue((g.moveY ?? 0) - touchOffset.current.y);
                scheduleIndexUpdate(g.moveX ?? 0, g.moveY ?? 0);
            },
            onPanResponderRelease: (_evt, g) => {
                const px = g.moveX ?? g.x0 ?? 0;
                const py = g.moveY ?? g.y0 ?? 0;
                const inside = inTimeline(px, py);
                const idx = inside ? pointToIndex(px, py) : -1;
                dlog("release palette", { px, py, inside, idx });

                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1;
                if (idx >= 0) insertAtRef.current(m, idx);
            },
            onPanResponderTerminate: () => {
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1;
            },
        });

        paletteResponders.current.set(m, r);
        return r;
    }, [inTimeline, pointToIndex, ghostX, ghostY, steps.length]);

    const getPanHandlers = useCallback(
        (m: Movement) => getPaletteResponder(m).panHandlers as Record<string, unknown>,
        [getPaletteResponder]
    );

    // TIMELINE -> reorder
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

            onPanResponderGrant: (_evt, g) => {
                fromIndexRef.current = i;
                touchOffset.current = { x: CHIP_W / 2, y: CHIP_H / 2 };
                setDragging(m);
                lastIndexRef.current = steps.length;
                setInsertIndex(steps.length);
                ghostX.setValue((g.x0 ?? 0) - touchOffset.current.x);
                ghostY.setValue((g.y0 ?? 0) - touchOffset.current.y);
                dlog("grant row", { x0: g.x0, y0: g.y0, from: i });
            },
            onPanResponderMove: (_evt, g) => {
                ghostX.setValue((g.moveX ?? 0) - touchOffset.current.x);
                ghostY.setValue((g.moveY ?? 0) - touchOffset.current.y);
                scheduleIndexUpdate(g.moveX ?? 0, g.moveY ?? 0);
            },
            onPanResponderRelease: (_evt, g) => {
                const px = g.moveX ?? g.x0 ?? 0;
                const py = g.moveY ?? g.y0 ?? 0;
                const inside = inTimeline(px, py);
                const toIdx = inside ? pointToIndex(px, py) : -1;
                const from = fromIndexRef.current ?? i;
                dlog("release row", { px, py, inside, toIdx, from });

                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1; fromIndexRef.current = null;

                if (toIdx >= 0) {
                    let to = toIdx;
                    if (to > from) to = to - 1;
                    if (to !== from && to >= 0 && to <= steps.length - 1) {
                        moveToRef.current(from, to);
                    }
                }
            },
            onPanResponderTerminate: () => {
                setDragging(null); setInsertIndex(-1); lastIndexRef.current = -1; fromIndexRef.current = null;
            },
        });

        timelineResponders.current.set(key, r);
        return r;
    }, [inTimeline, pointToIndex, ghostX, ghostY, steps.length]);

    // Render list with placeholder at insertIndex
    const renderWithPlaceholder: Array<{ kind: "ph" } | { kind: "mv"; m: Movement; i: number }> = [];
    steps.forEach((m, i) => {
        if (insertIndex === i) renderWithPlaceholder.push({ kind: "ph" });
        renderWithPlaceholder.push({ kind: "mv", m, i });
    });
    if (insertIndex === steps.length) renderWithPlaceholder.push({ kind: "ph" });

    return (
        <View style={S.root}>
            <MovementPalette getPanHandlers={getPanHandlers} dragActive={!!dragging} />

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
                                            width: CHIP_W,
                                            height: CHIP_H,
                                            marginRight: GAP_X,
                                            marginBottom: GAP_Y,
                                            opacity: dragging && (i === (fromIndexRef.current ?? -1)) ? 0.35 : 1,
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

            {dragging && (
                <Animated.View
                    pointerEvents="none"
                    style={{ position: "absolute", transform: [{ translateX: ghostX }, { translateY: ghostY }] }}
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
    sectionTitle: { color: "#cbd5e1", marginBottom: 8, fontWeight: "700" },
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
