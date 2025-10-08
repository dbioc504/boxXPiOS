// Droppable.tsx (replace your component body with this version)
import React, {useEffect, useRef} from "react";
import {View, type ViewProps, Dimensions} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import {useDnd} from "./DndProvider";

type Props = ViewProps & {
    id: string;
    children: React.ReactNode;
    overBorderColor?: string;
    idleBorderColor?: string;
    overBg?: string;
    idleBg?: string;
};

export function Droppable({
    id,
    style,
    children,
    overBorderColor = "#4b6cff",
    idleBorderColor = "transparent",
    overBg = "rgba(75,108,255,0.25)",
    idleBg = "#0b0b2a",
    ...rest
}: Props) {
    const { rects, overId, dragActive } = useDnd();
    const ref = useRef<View>(null);

    // Mirror id into a shared value so the worklet compares SV→SV
    const myId = useSharedValue(id);
    useEffect(() => {
        myId.value = id;
    }, [id]);

    const measure = () => {
        // @ts-ignore
        ref.current?.measureInWindow?.((x: number, y: number, w: number, h: number) => {
            if ([x,y,w,h].every(Number.isFinite)) {
                rects.value = { ...rects.value, [id]: { x, y, width: w, height: h } };
            }
        });
    };

    const onLayout = () => {
        // measure now and again on next tick to catch flex-wrap settling
        measure();
        setTimeout(measure, 0);
        requestAnimationFrame(measure);
    };

    useEffect(() => {
        // mount: a couple of extra re-measures to be safe
        const t0 = setTimeout(measure, 0);
        const t1 = setTimeout(measure, 50);
        const sub = Dimensions.addEventListener?.("change", measure);
        return () => {
            clearTimeout(t0); clearTimeout(t1);
            sub?.remove?.();
            const copy = { ...rects.value };
            delete copy[id];
            rects.value = copy;
        };
    }, [id]);

    useEffect(() => {
        // while dragging, refresh ~15fps so rects stay accurate if rows wrap
        let timer: any = null;
        let running = true;

        const loop = () => {
            if (!running) return;
            // read SV in effect (OK)
            if (dragActive.value === 1) measure();
            timer = setTimeout(loop, 66); // ~15fps
        };

        loop();
        return () => { running = false; clearTimeout(timer); };
    }, [dragActive]);

    const aStyle = useAnimatedStyle(() => {
        const isOver = overId.value === id;
        return {
            borderWidth: 2,
            borderColor: isOver ? "#4b6cff" : "#334155",
            backgroundColor: isOver ? "rgba(75,108,255,0.25)" : "rgba(15,23,42,0.13)",
            borderRadius: 12,
        };
    });

    return (
        <View ref={ref} onLayout={onLayout} collapsable={false} {...rest}>
            <Animated.View style={[style, aStyle]}>{children}</Animated.View>
        </View>
    );
}
