// GhostAtOrigin.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDnd } from '@/screens/Combos/DndComponents/DndProvider';


export function GhostAtOrigin({ originIndex, hoveredIndex, renderChip }: {
    originIndex: number;
    hoveredIndex: number;
    renderChip:(i: number) => React.ReactNode;
}) {
    const { rects } = useDnd();

    const aStyle = useAnimatedStyle(() => {
        const origin = rects.value[`chip-${originIndex}`];
        const hovered = rects.value[`chip-${hoveredIndex}`];

        const originW = origin?.width ?? 0;
        const ghostW = hovered?.width ?? originW;

        const dx = (ghostW - originW) / 2;

        return {
            position: 'absolute',
            left: -dx,
            right: undefined,
            top: 0,
            bottom: 0,
            width: ghostW,
            zIndex: 2,
            opacity: 0.35,
        } as const;
    });

    return (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, aStyle]}>
            <View style={{ flex: 0 }}>{renderChip(hoveredIndex)}</View>
        </Animated.View>
    );
}