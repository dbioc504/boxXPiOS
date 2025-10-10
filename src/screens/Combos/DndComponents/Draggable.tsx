import React, {useEffect, useRef} from "react";
import {View, type ViewProps} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {type Rect, useDnd} from "./DndProvider";

type Props = ViewProps & {
    id: string;
    onDrop?: (dragId: string, overId: string | null) => void;
    children: React.ReactNode;
};

// More-forgiving hover with padding + hysteresis + vertical banding
function hitForgiving(
    rects: Record<string, Rect> | null | undefined,
    cx: number,
    cy: number,
    excludeId: string | null,
    prevHoverId: string | null
): string | null {
    "worklet";
    if (!rects) return null;

    // Tunables (increase if you still want it looser)
    const CHIP_ENTER_PAD = 20;   // bigger => easier to acquire a chip
    const CHIP_EXIT_PAD  = 28;   // bigger => stickier once acquired
    const SLOT_ENTER_PAD = 24;   // easier to acquire edge slots
    const Y_BAND_FACTOR  = 1.6;  // restrict chips to near-current row

    // Helper to test inside expanded rect
    const inside = (r: Rect, pad: number) => {
        const x0 = r.x - pad, y0 = r.y - pad, x1 = r.x + r.width + pad, y1 = r.y + r.height + pad;
        return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
    };

    // 1) If we had a previous hover target, try to keep it (hysteresis)
    if (prevHoverId && prevHoverId in (rects as any)) {
        const r = rects[prevHoverId]!;
        const pad = prevHoverId.startsWith("chip-") ? CHIP_EXIT_PAD : SLOT_ENTER_PAD;
        if (inside(r, pad)) {
            return prevHoverId;
        }
    }

    // 2) Chips: collect candidates inside ENTER zone, filtered by same-row band
    let bestChipId: string | null = null;
    let bestChipDist = Infinity;

    // If we have a previous chip, estimate a row height from it for banding
    let rowHeight = 0;
    if (prevHoverId && prevHoverId.startsWith("chip-")) {
        const rr = rects[prevHoverId];
        if (rr) rowHeight = rr.height;
    }
    // If not, approximate row height from any chip (first seen)
    if (!rowHeight) {
        for (const key in rects) {
            if (key.startsWith("chip-")) { rowHeight = rects[key].height; break; }
        }
    }
    const yBand = rowHeight ? rowHeight * Y_BAND_FACTOR : Infinity;

    for (const key in rects) {
        if (!key.startsWith("chip-")) continue;
        if (excludeId && key === excludeId) continue;
        const r = rects[key];
        if (!r) continue;

        // Vertical banding (stay near the current row)
        if (Math.abs(cy - (r.y + r.height / 2)) > yBand / 2) continue;

        if (inside(r, CHIP_ENTER_PAD)) {
            const cxr = r.x + r.width / 2;
            const cyr = r.y + r.height / 2;
            const d = Math.hypot(cxr - cx, cyr - cy);
            if (d < bestChipDist) {
                bestChipDist = d;
                bestChipId = key;
            }
        }
    }
    if (bestChipId) return bestChipId;

    // 3) Slots (edge-only behavior is enforced in Droppable visuals + DropListener rules)
    let bestSlotId: string | null = null;
    let bestSlotDist = Infinity;
    for (const key in rects) {
        if (!key.startsWith("slot-")) continue;
        const r = rects[key];
        if (!r) continue;
        if (inside(r, SLOT_ENTER_PAD)) {
            const cxr = r.x + r.width / 2;
            const cyr = r.y + r.height / 2;
            const d = Math.hypot(cxr - cx, cyr - cy);
            if (d < bestSlotDist) {
                bestSlotDist = d;
                bestSlotId = key;
            }
        }
    }

    return bestSlotId ?? null;
}

function hitSlotsOnly(
    rects: Record<string, Rect> | null | undefined,
    cx: number,
    cy: number
): string | null {
    "worklet";
    if (!rects) return null;
    const SLOT_ENTER_PAD = 24;
    let best: string | null = null;
    let bestDist = Infinity;
    const inside = (r: Rect, pad: number) => {
        const x0 = r.x - pad, y0 = r.y - pad, x1 = r.x + r.width + pad, y1 = r.y + r.height + pad;
        return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
    };

    for (const key in rects) {
        if (!key.startsWith("slot-")) continue;
        const r = rects[key];
        if (!r) continue;
        if (inside(r, SLOT_ENTER_PAD)) {
            const cxr = r.x + r.width / 2;
            const cyr = r.y + r.height / 2;
            const d = Math.hypot(cxr - cx, cyr - cy);
            if (d < bestDist) { bestDist= d; best = key; }
        }
    }
    return best;
}


export function Draggable({id, style, children, ...rest}: Props) {
    const {
        rects, overId, dropDragId, dropOverId, dropSeq, dragActive,
        activeDragId, dragFromIndex, hoverChipId, hoverSlotId
    } = useDnd();

    const HOVER_DWELL_MS = 80;


    useEffect(() => {
        return () => {
            // remove my rect on unmount to avoid stale hits
            const map = { ...rects.value };
            delete map[id];
            rects.value = map;
        };
    }, [id, rects]);

    // measure the wrapper's absolute (window) position once it's laid out
    const ref = useRef<View>(null);
    const winX0 = useSharedValue(0);
    const winY0 = useSharedValue(0);
    const measured = useSharedValue(0); // 0 = not measured, 1 = measured

    // drag state
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const w = useSharedValue(0);
    const h = useSharedValue(0);

    const hoverCandidateId = useSharedValue<string | null>(null);
    const hoverCandidateSince = useSharedValue(0);
    const latchedHoverId = useSharedValue<string | null>(null);

    const onLayout = () => {
        setTimeout(() => {
            ref.current?.measureInWindow?.((x,y,w0,h0) => {
                if ([x,y,w0,h0].every(Number.isFinite)) {
                    winX0.value = x; winY0.value = y;
                    w.value = w0; h.value = h0;
                    measured.value = 1;
                    rects.value = { ...rects.value, [id]: { x, y, width: w0, height: h0 } };
                }
            });
        }, 0);

        // bonus: re-measure once more after layout settles (wraps)
        setTimeout(() => {
            ref.current?.measureInWindow?.((x,y,w0,h0) => {
                if ([x,y,w0,h0].every(Number.isFinite)) {
                    rects.value = { ...rects.value, [id]: { x, y, width: w0, height: h0 } };
                }
            });
        }, 50);
    };


    const pan = Gesture.Pan()
        .activateAfterLongPress(30)
        .minDistance(1)
        .onStart(() => {
            startX.value = tx.value;
            startY.value = ty.value;
            overId.value = null;
            dragActive.value = 1;

            activeDragId.value = id;
            if (id.startsWith("chip-")) {
                const n = Number(id.slice(5));
                dragFromIndex.value = Number.isFinite(n) ? n : null;
            } else {
                dragFromIndex.value = null;
            }
            hoverChipId.value = null;
            hoverSlotId.value = null;
            hoverCandidateId.value = null;
            latchedHoverId.value = null;
            hoverCandidateSince.value = 0;
        })
        .onUpdate((g) => {
            // update translation
            tx.value = startX.value + g.translationX;
            ty.value = startY.value + g.translationY;

            // need size + initial window coords before hit-testing
            if (measured.value === 0) return;
            const fingerBiasY = 6;
            const cx = g.absoluteX;
            const cy = g.absoluteY + fingerBiasY;

            // convert to WINDOW coordinates (match Droppable rects)
            const prevHover = latchedHoverId.value ?? null;

           const isPaletteDrag = id.startsWith("palette:");
           const candidate = isPaletteDrag
            ? hitSlotsOnly(rects.value, cx, cy)
            : hitForgiving(rects.value, cx, cy, id, prevHover);

            const now = Date.now();

            if (candidate !== hoverCandidateId.value) {
                hoverCandidateId.value = candidate;
                hoverCandidateSince.value = now;
            }

            // if there is no candidate, clear latch immediately
            if (!hoverCandidateId.value) {
                latchedHoverId.value = null;
            } else {
                // latch after dwell time
                if (now - hoverCandidateSince.value >= HOVER_DWELL_MS) {
                    latchedHoverId.value = hoverCandidateId.value;
                }
            }

            // drive visuals and typed hover ids from the *latched* hover
            const current = latchedHoverId.value;
            overId.value = current ?? null;

            if (id.startsWith("chip-")) {
                if (current && current.startsWith("chip-")) {
                    hoverChipId.value = current;
                    hoverSlotId.value = null;
                } else if (current && current.startsWith("slot-")) {
                    hoverChipId.value = null;
                    hoverSlotId.value = current;
                } else {
                    hoverChipId.value = null;
                    hoverSlotId.value = null;
                }
            } else {
                hoverChipId.value = null;
                hoverSlotId.value = current && current.startsWith("slot-") ? current : null;
            }
        })
        .onEnd(() => {
            // choose best target at release time
            let target = latchedHoverId.value ?? hoverChipId.value ?? hoverSlotId.value ?? overId.value ?? null;

            // never treat self as a target (no-op)
            if (target === id) target = null;

            dropDragId.value = id;
            dropOverId.value = target;
            dropSeq.value = dropSeq.value + 1;

            // reset visuals
            tx.value = withSpring(0);
            ty.value = withSpring(0);
            overId.value = null;

            hoverChipId.value = null;
            hoverSlotId.value = null;
            hoverCandidateId.value = null;
            latchedHoverId.value = null;
            hoverCandidateSince.value = 0;

            activeDragId.value = null;
            dragFromIndex.value = null;
            dragActive.value = 0;
        });

    const aStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: tx.value},
            {translateY: ty.value},
        ] as const,
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                ref={ref} style={[style, aStyle]} onLayout={onLayout}
                collapsable={false} {...rest}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
}
