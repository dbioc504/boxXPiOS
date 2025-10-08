// DroppableMin.tsx
import React from "react";
import { View, type LayoutChangeEvent, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

export default function DroppableMin() {
    const over = useSharedValue(false);

    const onLayout = (e: LayoutChangeEvent) => {
        // just registering layout for now; set a flag to see it's alive
        over.value = true;
    };

    const a = useAnimatedStyle(() => ({
        borderWidth: 2,
        borderColor: over.value ? "#4b6cff" : "transparent",
    }));

    return (
        <View style={S.wrap}>
            <Animated.View onLayout={onLayout} style={[S.target, a]} />
        </View>
    );
}
const S = StyleSheet.create({
    wrap: { marginTop: 24 },
    target: { width: 120, height: 120, borderRadius: 12, backgroundColor: "#0b0b2a" },
});
