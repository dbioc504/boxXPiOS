import React, { useRef } from "react";
import { type LayoutChangeEvent, View, type ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { type Rect, useDnd } from "./DndProvider";

type Props = ViewProps & {
    id: string;
    // kept for API compatibility; not used in zero-bridge mode
    onDrop?: (dragId: string, overId: string | null) => void;
    children: React.ReactNode;
};

function hit(
    rects: Record<string, Rect> | null | undefined,
    x: number,
    y: number,
    w: number,
    h: number
): string | null {
    "worklet";

    if (!rects || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;

    const cx = x + w / 2;
    const cy = y + h / 2;

    for (const key in rects) {
        const r = rects[key];
        if (!r) continue;
        const { x: rx, y: ry, width: rw, height: rh } = r;
        if (!Number.isFinite(rx) || !Number.isFinite(ry) || !Number.isFinite(rw) || !Number.isFinite(rh) || rw <= 0 || rh <= 0) {
            continue;
        }
        if (cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh) return key;
    }
    return null;
}

export function Draggable({ id, style, children, ...rest }: Props) {
    const { rects, overId, dropDragId, dropOverId, dropSeq, dragActive } = useDnd();

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

    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        w.value = width;
        h.value = height;

        // measureInWindow after layout to get absolute origin of the wrapper
        setTimeout(() => {
            // @ts-ignore measureInWindow is available on native views
            ref.current?.measureInWindow?.((x: number, y: number) => {
                if (Number.isFinite(x) && Number.isFinite(y)) {
                    winX0.value = x;
                    winY0.value = y;
                    measured.value = 1;
                }
            });
        }, 0);
    };

    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = tx.value;
            startY.value = ty.value;
            overId.value = null;
            dragActive.value = 1;
        })
        .onUpdate((g) => {
            // update translation
            tx.value = startX.value + g.translationX;
            ty.value = startY.value + g.translationY;

            // need size + initial window coords before hit-testing
            if (measured.value === 0 || w.value <= 0 || h.value <= 0) return;

            // convert to WINDOW coordinates (match Droppable rects)
            const winX = winX0.value + tx.value;
            const winY = winY0.value + ty.value;

            let over: string | null;
            try {
                over = hit(rects.value, winX, winY, w.value, h.value);
            } catch {
                over = null;
            }
            overId.value = over ?? null;
        })
        .onEnd(() => {
            // publish drop event via shared values (zero-bridge)
            dropDragId.value = id;
            dropOverId.value = overId.value;
            dropSeq.value = dropSeq.value + 1;

            // reset visuals
            tx.value = withSpring(0);
            ty.value = withSpring(0);
            overId.value = null;
            dragActive.value = 0;
        });

    const aStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
        ] as const,
    }));

    return (
        <GestureDetector gesture={pan}>
            <View ref={ref} onLayout={onLayout} collapsable={false} {...rest}>
                <Animated.View style={[style, aStyle]}>{children}</Animated.View>
            </View>
        </GestureDetector>
    );
}
