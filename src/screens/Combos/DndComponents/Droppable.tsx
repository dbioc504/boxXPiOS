// Droppable.tsx (replace your component body with this version)
import React, {useEffect, useRef} from "react";
import {Dimensions, View, type ViewProps} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import {useDnd} from "./DndProvider";

type Props = ViewProps & {
    id: string;
    children: React.ReactNode;
    overBorderColor?: string;
    idleBorderColor?: string;
    overBg?: string;
    idleBg?: string;
    edgeOnly?: boolean;
};

export function Droppable({
    id,
    style,
    children,
    overBorderColor = "#4b6cff",
    idleBorderColor = "transparent",
    overBg = "rgba(75,108,255,0.25)",
    idleBg = "#0b0b2a",
    edgeOnly = false,
    ...rest
}: Props) {
    const { rects, overId, dragActive, activeDragId } = useDnd();
    const ref = useRef<View>(null);
    const edgeSV = useSharedValue(edgeOnly);
    useEffect(() => { edgeSV.value = edgeOnly }, [edgeOnly]);

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
        let timer: any = null;
        let running = true;

        const loop = () => {
            if (!running) return;
            if (dragActive.value === 1) measure();
            const delay = dragActive.value === 1 ? 16 : 66;
            timer = setTimeout(loop, delay); // ~15fps
        };

        loop();
        return () => { running = false; clearTimeout(timer); };
    }, [dragActive]);

    const aStyle = useAnimatedStyle(() => {
        const dragId = activeDragId.value ?? '';
        const isChipDrag = dragId.startsWith('chip-');
        const isPaletteDrag = dragId.startsWith('palette:');
        const canReact =
            isPaletteDrag
                ? true                 // palette can use ALL slots
                : isChipDrag
                    ? edgeSV.value === true  // chips: only edge slots
                    : false;
        const isOver = overId.value === id;


        return {
            borderWidth: 2,
            borderColor: isOver && canReact ? "#4b6cff" : "#334155",
            backgroundColor: isOver && canReact?  "rgba(75,108,255,0.25)" : "rgba(15,23,42,0.13)",
            borderRadius: 12,
        };
    });

    return (
        <View ref={ref} onLayout={onLayout} collapsable={false} {...rest}>
            <Animated.View style={[style, aStyle]}>{children}</Animated.View>
        </View>
    );
}
