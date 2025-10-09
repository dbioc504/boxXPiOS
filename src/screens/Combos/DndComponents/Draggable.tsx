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

function hitByCenter(
    rects: Record<string, Rect> | null | undefined,
    cx: number,
    cy: number,
    excludeId: string | null
): string | null {
    "worklet";
    if (!rects) return null;

    const SLOT_PAD = 12;
    const CHIP_PAD = 6;

    for (const key in rects) {
        if (!key.startsWith('chip-')) continue;
        if (excludeId && key === excludeId) continue;

        const r = rects[key];
        if (!r) continue;

        const rx0 = r.x - CHIP_PAD;
        const ry0 = r.y - CHIP_PAD;
        const rw2 = r.width + CHIP_PAD * 2;
        const rh2 = r.height + CHIP_PAD * 2;
        if (
            Number.isFinite(rx0) && Number.isFinite(ry0) &&
            Number.isFinite(rw2) && Number.isFinite(rh2) &&
            rw2 > 0 && rh2 > 0 &&
            cx >= rx0 && cx <= rx0 + rw2 &&
            cy >= ry0 && cy <= ry0 + rh2
        ) {
            return key;
        }
    }

    for (const key in rects) {
        if (!key.startsWith("slot-")) continue;

        const r = rects[key];
        if (!r) continue;

        const pad = SLOT_PAD;
        const rx0 = r.x - pad;
        const ry0 = r.y - pad;
        const rw2 = r.width + pad * 2;
        const rh2 = r.height + pad * 2;

        if (
            Number.isFinite(rx0) && Number.isFinite(ry0) &&
            Number.isFinite(rw2) && Number.isFinite(rh2) &&
            rw2 > 0 && rh2 > 0 &&
            cx >= rx0 && cx <= rx0 + rw2 &&
            cy >= ry0 && cy <= ry0 + rh2
        ) {
            return key;
        }
    }
    return null;
}

export function Draggable({id, style, children, ...rest}: Props) {
    const {
        rects, overId, dropDragId, dropOverId, dropSeq, dragActive,
        activeDragId, dragFromIndex, hoverChipId, hoverSlotId
    } = useDnd();

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
        })
        .onUpdate((g) => {
            // update translation
            tx.value = startX.value + g.translationX;
            ty.value = startY.value + g.translationY;

            // need size + initial window coords before hit-testing
            if (measured.value === 0) return;

            // convert to WINDOW coordinates (match Droppable rects)
            const fingerBiasY = 6;
            const cx = g.absoluteX;
            const cy = g.absoluteY + fingerBiasY;
            const over = hitByCenter(rects.value, cx, cy, id);
            overId.value = over ?? null;

            if (id.startsWith("chip-")) {
                if (over && over.startsWith("chip-")) {
                    hoverChipId.value = over;
                    hoverSlotId.value = null;
                } else if (over && over.startsWith("slot-")) {
                    hoverChipId.value = null;
                    hoverSlotId.value = over;
                } else {
                    hoverChipId.value = null;
                    hoverSlotId.value = null;
                }
            }
        })
        .onEnd(() => {
            // choose best target at release time
            let target = hoverChipId.value ?? hoverSlotId.value ?? overId.value ?? null;

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
