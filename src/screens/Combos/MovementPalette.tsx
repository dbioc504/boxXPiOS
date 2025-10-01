import React, {useCallback, useMemo, useRef, useState} from "react";
import {
    View, Text, FlatList, Pressable,
    NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, StyleSheet,
} from "react-native";
import { PUNCHES, BODY_PUNCHES, DEFENSES, MOVEMENT_LABEL, type Movement } from "@/types/common";

const GROUPS = [
    { key: 'punches', title: 'PUNCHES', items: PUNCHES as Movement[] },
    { key: 'body',    title: 'BODY',    items: BODY_PUNCHES as Movement[] },
    { key: 'defense', title: 'DEFENSE', items: DEFENSES as Movement[] }
] as const;

type Props = {
    getPanHandlers?: (m: Movement) => Record<string, unknown>;
    onPressChip?: (m: Movement) => void;
    baseRows?: number;
    maxRowsAuto?: number;
    chipMinWidth?: number;
    chipGap?: number;
    contentPadding?: number;
    dragActive?: boolean;
};

export default function MovementPalette({
    getPanHandlers,
    onPressChip,
    baseRows = 3,
    maxRowsAuto = 5,
    chipMinWidth = 96,
    chipGap = 8,
    contentPadding = 12,
    dragActive = false,
}: Props) {
    const [activeGroup, setActiveGroup] = useState(0);
    const [panelWidth, setPanelWidth] = useState(0);
    const listRef = useRef<FlatList<Movement[]> | null>(null);
    const [pageIndex, setPageIndex] = useState(0);

    const onPanelLayout = (e: LayoutChangeEvent) => {
        setPanelWidth(Math.floor(e.nativeEvent.layout.width));
    };

    const usableW = Math.max(0, panelWidth - contentPadding * 2);

    const { pages, columns, rowsForGroup, chipWidth } = useMemo(() => {
        const items = GROUPS[activeGroup].items;
        if (usableW <= 0) {
            return { pages: [items], columns: 1, rowsForGroup: baseRows, chipWidth: chipMinWidth };
        }

        const minColumns = Math.max(1, Math.floor((usableW + chipGap) / (chipMinWidth + chipGap)));
        let columns = minColumns;

        const neededRows = Math.ceil(items.length / columns);

        let rowsForGroup = baseRows;
        let singlePage = false;

        if (items.length <= columns * baseRows) {
            rowsForGroup = baseRows; singlePage = true;
        } else if (neededRows <= maxRowsAuto) {
            rowsForGroup = neededRows; singlePage = true;
        } else {
            rowsForGroup = baseRows; singlePage = false;
        }

        const chipWidth = Math.floor((usableW - chipGap * (columns - 1)) / columns);
        const perPage = columns * rowsForGroup;

        const chunk = (arr: Movement[], size: number) => {
            const out: Movement[][] = [];
            for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
            return out;
        };
        const pages = singlePage ? [items] : chunk(items, perPage);

        return { pages, columns, rowsForGroup, chipWidth };
    }, [activeGroup, usableW, baseRows, chipMinWidth, chipGap, maxRowsAuto]);

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const w = panelWidth || 1;
        const idx = Math.round(x / w);
        if (idx !== pageIndex) setPageIndex(idx);
    };

    const goToPage = useCallback((idx: number) => {
        setPageIndex(idx);
        listRef.current?.scrollToIndex({ index: idx, animated: true });
    }, []);

    const onTabPress = (i: number) => {
        setActiveGroup(i);
        setPageIndex(0);
        requestAnimationFrame(() => goToPage(0));
    };

    const renderPage = ({ item }: { item: Movement[] }) => (
        <View style={[S.page, { width: panelWidth, paddingHorizontal: contentPadding }]}>
            <View style={[S.grid, { gap: chipGap }]}>
                {item.map((m) => {
                    const pan = getPanHandlers ? getPanHandlers(m) : {};
                    return (
                        <View
                            key={m}
                            {...pan}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={[S.chip, { width: chipWidth}]}
                            accessibilityRole="button"
                            accessibilityLabel={MOVEMENT_LABEL[m]}
                        >
                            <Text style={S.chipText}>{MOVEMENT_LABEL[m]}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View onLayout={onPanelLayout} style={S.container}>
            {/* Tabs */}
            <View style={S.tabs}>
                {GROUPS.map((g, i) => {
                    const active = i === activeGroup;
                    return (
                        <Pressable
                            key={g.key}
                            onPress={() => onTabPress(i)}
                            accessibilityRole='button'
                            style={[S.tab, active && S.tabActive]}
                        >
                            <Text style={[S.tabText, active && S.tabTextActive]}>{g.title}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Only render pages after width is known, so getItemLayout uses real sizes */}
            {panelWidth > 0 && (
                <FlatList
                    ref={listRef}
                    data={pages}
                    keyExtractor={(_, i) => `page-${i}`}
                    horizontal
                    pagingEnabled
                    scrollEnabled={!dragActive && pages.length > 1}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderPage}
                    onMomentumScrollEnd={onMomentumEnd}
                    getItemLayout={(_, index) => ({ length: panelWidth, offset: panelWidth * index, index })}
                    scrollEventThrottle={16}
                />
            )}

        </View>
    );
}

const S = StyleSheet.create({
    container: { width: "100%" },
    tabs: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingBottom: 8,
        justifyContent: 'center'
    },
    tab: {
        marginRight: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#2a2a2a",
    },
    tabActive: { backgroundColor: "#4b6cff" },
    tabText: { color: "#ddd", fontSize: 14 },
    tabTextActive: { color: "#fff", fontWeight: "600" },
    page: { paddingTop: 4, paddingBottom: 8 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
        minHeight: 44,
        marginBottom: 8,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#1f2937",
        justifyContent: "center",
    },
    chipText: { color: "#fff", fontSize: 16 },
});
