import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, Pressable, FlatList, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { BodyText } from "@/theme/T";
import { colors } from "@/theme/theme";

type PickerMode = "rounds" | "roundTime" | "restTime" | "getReadyTime";

interface CustomTimePickerProps {
    mode: PickerMode;
    initialValue: number;
    onClose: () => void;
    onConfirm: (value: number) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPACER = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;
const CENTER = (VISIBLE_ITEMS - 1) / 2;

function getValuesForMode(mode: PickerMode): number[] {
    switch (mode) {
        case "rounds":
            return Array.from({ length: 50 }, (_, i) => i + 1);
        case "roundTime":
            return [60, 120, 180, 240];
        case "restTime":
        case "getReadyTime":
            return [0, 15, 30, 45, 60];
        default:
            return [];
    }
}

function formatValue(value: number, mode: PickerMode) {
    if (mode === "rounds") return String(value);
    if (value < 60) return `${value}s`;
    return `${Math.floor(value / 60)}m`;
}

export function CustomTimePicker({
    mode,
    initialValue,
    onClose,
    onConfirm
}: CustomTimePickerProps) {
    const flatlistRef = useRef<FlatList<number>>(null);
    const values = useMemo(() => getValuesForMode(mode), [mode]);

    const [selectedIndex, setSelectedIndex] = useState(() => {
        const idx = values.indexOf(initialValue);
        return idx >= 0 ? idx : 0;
    });

    useEffect(() => {
        const idx = values.indexOf(initialValue);
        setSelectedIndex(idx >= 0 ? idx : 0);
    }, [values, initialValue]);


    const offsetToIndex = (y: number) => {
        const idx = Math.round((y + CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2) / ITEM_HEIGHT) - CENTER;
        return Math.max(0, Math.min(values.length - 1, idx));
    };

    const indexToOffset = (i: number) => i * ITEM_HEIGHT;


    const snapToOffsets = useMemo(
        () => values.map((_, i) => indexToOffset(i)),
        [values]
    );

    useEffect(() => {
        flatlistRef.current?.scrollToOffset({
            offset: indexToOffset(selectedIndex),
            animated: false
        });
    }, []);

    const lastHapticAt = useRef(0);
    const tickHaptic = () => {
        const now = Date.now();
        if (now - lastHapticAt.current < 70) return;
        lastHapticAt.current = now;
        Haptics.selectionAsync();
    };

    const handleScroll = (e: any) => {
        const idx = offsetToIndex(e.nativeEvent.contentOffset.y);
        if (idx !== selectedIndex) {
            setSelectedIndex(idx);
            tickHaptic();
        }
    };

    const handleMomentumScrollEnd = (e: any) => {
        const idx = offsetToIndex(e.nativeEvent.contentOffset.y);
        if (idx !== selectedIndex) setSelectedIndex(idx);
    };

    const getItemLayout = (_: any, index: number)=> ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
    });

    const renderItem = ({ item, index }: { item: number, index: number }) => {
        const isSelected = index === selectedIndex;
        const distance = Math.abs(index - selectedIndex);
        const opacity = Math.max(0.3, 1 - distance * 0.25);
        const scale = isSelected ? 1.06 : 1 - distance * 0.06;

        return (
            <View style={[S.item, { height: ITEM_HEIGHT }]}>
                <BodyText
                    style={[
                        S.itemText,
                        {
                            opacity,
                            transform: [{ scale }],
                            color: isSelected ? 'white' : colors.offWhite,
                            fontWeight: isSelected ? "800" : "400"
                        }
                    ]}
                >
                    {formatValue(item, mode)}
                </BodyText>
            </View>
        );
    };

    const title =
        mode === "rounds"
        ? "Select Rounds"
        : mode === "roundTime"
        ? "Select Round Time"
        : mode === "restTime"
        ? "Select Rest Time"
        : "Select Get Ready Time";

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <View style={S.overlay}>
                <View style={S.container}>
                    <BodyText style={S.title}>{title}</BodyText>

                    <View style={S.pickerContainer}>
                        <View style={S.selectionIndicator} pointerEvents="none"/>

                        <FlatList
                            ref={flatlistRef}
                            data={values}
                            keyExtractor={(item) => item.toString()}
                            renderItem={renderItem}
                            getItemLayout={getItemLayout}
                            showsVerticalScrollIndicator={false}
                            snapToOffsets={snapToOffsets}
                            snapToAlignment="start"
                            disableIntervalMomentum
                            decelerationRate="fast"
                            onScroll={handleScroll}
                            onMomentumScrollEnd={handleMomentumScrollEnd}
                            scrollEventThrottle={16}
                            ListHeaderComponent={<View style={{ height: SPACER }}/>}
                            ListFooterComponent={<View style={{ height: SPACER }}/>}
                            style={{ height: CONTAINER_HEIGHT }}
                        />
                    </View>

                    <View style={S.buttonRow}>
                        <Pressable onPress={onClose} style={({ pressed }) => [S.button, pressed && S.buttonPressed]}>
                            <BodyText style={S.buttonText}>CANCEL</BodyText>
                        </Pressable>
                        <Pressable onPress={() => onConfirm(values[selectedIndex])} style={({ pressed }) => [S.button, pressed && S.buttonPressed]}>
                            <BodyText style={[S.buttonText, { color: '#2821FF' }]}>DONE</BodyText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
    container: { backgroundColor: colors.timeContainer, borderRadius: 12, padding: 16, },
    title: { color: colors.offWhite, fontWeight: "700", fontSize: 18, marginBottom: 16, textAlign: "center" },
    pickerContainer: { height: CONTAINER_HEIGHT, position: "relative", marginBottom: 16 },
    selectionIndicator: {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        marginTop: -ITEM_HEIGHT / 2,
        zIndex: 1,
        backgroundColor: colors.timePicker,
        opacity: 0.3
    },
    item: { justifyContent: "center", alignItems: "center" },
    itemText: { fontSize: 24 },
    buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    button: {
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: { opacity: 0.7 },
    buttonText: { color: colors.offWhite, fontWeight: '500' },
});