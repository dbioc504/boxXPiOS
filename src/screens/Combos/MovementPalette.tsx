import React, { useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Pressable,
} from "react-native";
import { Draggable } from "@mgcrea/react-native-dnd";
import {
    PUNCHES,
    BODY_PUNCHES,
    DEFENSES,
    MOVEMENT_LABEL,
    type Movement,
} from "@/types/common";
import { CHIP_W, CHIP_H, GAP_X, GAP_Y } from "@/screens/Combos/ui";

const GROUPS = [
    { key: "punches", title: "PUNCHES", items: PUNCHES as Movement[] },
    { key: "body",    title: "BODY PUNCHES",    items: BODY_PUNCHES as Movement[] },
    { key: "defense", title: "DEFENSE", items: DEFENSES as Movement[] },
] as const;

type Props = {
    dragActive?: boolean;
    contentPadding?: number;
}

export function MovementPalette({
    dragActive = false,
    contentPadding = 12
}: Props) {
    const { width } = useWindowDimensions();
    const [pageIndex, setPageIndex] = useState(0);
    const listRef = useRef<FlatList<(typeof GROUPS)[number]>>(null)

    const goToPage = (idx: number) => {
        setPageIndex(idx);
        listRef.current?.scrollToIndex({ index: idx, animated: true });
    };

    const renderPage = ({ item }: { item: (typeof GROUPS)[number]; }) => (
        <View style={[S.page, { width, paddingHorizontal: contentPadding }]}>
            {/* Actual Movement Chip */}
            <View style={S.grid}>
                {item.items.map((m) => (
                    <Draggable key={m} id={`mv-${m}`} data={{ movement: m }}>
                        <View
                            style={[
                                S.chip,
                                {
                                    width: CHIP_W,
                                    height: CHIP_H,
                                    marginRight: GAP_X,
                                    marginBottom: GAP_Y
                                },
                            ]}
                            accessible
                            accessibilityLabel={MOVEMENT_LABEL[m]}
                        >
                            <Text style={S.chipText}>{MOVEMENT_LABEL[m]}</Text>
                        </View>
                    </Draggable>
                ))}
            </View>
        </View>
    );

    return (
        <View style={S.container}>
            <View
                style={S.tabs}
                accessibilityRole='tablist'
            >
                {GROUPS.map((g, i) => {
                    const active = i === pageIndex;
                    return (
                        <Pressable
                            key={g.key}
                            onPress={() => goToPage(i)}
                            style={[S.tab, active && S.tabActive]}
                        >
                            <Text style={[S.tabText, active && S.tabTextActive]}>{g.title}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <FlatList
                ref={listRef}
                data={GROUPS as any}
                renderItem={renderPage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />
        </View>
    );
}


const S = StyleSheet.create({
    container: { width: "100%" },
    page: { paddingTop: 10, paddingBottom: 8 },
    tabs: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 8,
      gap: 8
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#2a2a2a",
    },
    tabActive: { backgroundColor: "#4b6cff" },
    tabText: { color: "#ddd", fontSize: 14 },
    tabTextActive: { color: "#fff", fontWeight: "600" },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    chip: { borderRadius: 16, backgroundColor: "#8e8af7", justifyContent: "center", paddingHorizontal: 12 },
    chipText: { color: "#0b0b2a", fontSize: 12.3, fontWeight: "600" },
});