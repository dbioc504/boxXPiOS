// src/screens/Combos/MovementPalette.tsx
import React, {useCallback, useMemo, useRef, useState} from "react";
import {
    View, Text, FlatList, LayoutChangeEvent,
    NativeSyntheticEvent, NativeScrollEvent, StyleSheet,
} from "react-native";
import { PUNCHES, BODY_PUNCHES, DEFENSES, MOVEMENT_LABEL, type Movement } from "@/types/common";
import { CHIP_H, GAP_X, GAP_Y } from "./ui"; // we compute width per-device

const GROUPS = [
    { key: 'punches', title: 'PUNCHES', items: PUNCHES as Movement[] },
    { key: 'body',    title: 'BODY',    items: BODY_PUNCHES as Movement[] },
    { key: 'defense', title: 'DEFENSE', items: DEFENSES as Movement[] }
] as const;

type Props = {
    getPanHandlers?: (m: Movement) => Record<string, unknown>;
    onPressChip?: (m: Movement) => void;
    /** Force a specific number of columns (default 3) */
    columns?: number;
    baseRows?: number;
    maxRowsAuto?: number;
    contentPadding?: number;
    dragActive?: boolean;
};

export default function MovementPalette({
                                            getPanHandlers,
                                            onPressChip,
                                            columns = 3,           // <- force 3 columns
                                            baseRows = 3,
                                            maxRowsAuto = 5,
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

    const { pages, cols, rowsForGroup, chipW } = useMemo(() => {
        const items = GROUPS[activeGroup].items;

        const cols = Math.max(1, Math.floor(columns));

        const chipW = cols > 0
            ? Math.floor((usableW - GAP_X * (cols - 1)) / cols)
            : usableW;

        const neededRows = cols > 0 ? Math.ceil(items.length / cols) : 1;

        let rows = baseRows;
        let single = false;
        if (items.length <= cols * baseRows) { rows = baseRows; single = true; }
        else if (neededRows <= maxRowsAuto) { rows = neededRows; single = true; }
        else { rows = baseRows; single = false; }

        const perPage = Math.max(1, cols * rows);

        const chunk = (arr: Movement[], size: number) => {
            const out: Movement[][] = [];
            for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
            return out;
        };

        const pages = single ? [items] : chunk(items, perPage);
        return { pages, cols, rowsForGroup: rows, chipW };
    }, [activeGroup, usableW, baseRows, maxRowsAuto, columns]);

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

    const renderGrid = (items: Movement[]) => (
        <View style={S.grid}>
            {items.map((m, i) => {
                const pan = getPanHandlers ? getPanHandlers(m) : {};
                const isLastCol = ((i + 1) % cols === 0);
                return (
                    <View
                        key={`${m}-${i}`}
                        {...pan}
                        style={[
                            S.chip,
                            {
                                width: chipW,
                                height: CHIP_H,
                                marginRight: isLastCol ? 0 : GAP_X,
                                marginBottom: GAP_Y,
                            },
                        ]}
                        accessibilityLabel={MOVEMENT_LABEL[m]}
                        accessible
                    >
                        <Text style={S.chipText}>{MOVEMENT_LABEL[m]}</Text>
                    </View>
                );
            })}
        </View>
    );

    const renderPage = ({ item }: { item: Movement[] }) => (
        <View style={[S.page, { width: panelWidth, paddingHorizontal: contentPadding }]}>
            {renderGrid(item)}
        </View>
    );

    return (
        <View
            onLayout={onPanelLayout}
            collapsable={false}
            style={[S.container, { alignSelf: "stretch" }]}
        >
            {/* Tabs */}
            <View style={S.tabs}>
                {GROUPS.map((g, i) => {
                    const active = i === activeGroup;
                    return (
                        <View key={g.key} style={[S.tab, active && S.tabActive]}>
                            <Text
                                onPress={() => onTabPress(i)}
                                style={[S.tabText, active && S.tabTextActive]}
                            >
                                {g.title}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Fallback grid before width is known */}
            {panelWidth === 0 && (
                <View style={[S.page, { paddingHorizontal: contentPadding }]}>
                    {renderGrid(GROUPS[activeGroup].items)}
                </View>
            )}

            {/* Paged once width known */}
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
                    getItemLayout={(_, index) => ({
                        length: panelWidth,
                        offset: panelWidth * index,
                        index,
                    })}
                    scrollEventThrottle={16}
                />
            )}
        </View>
    );
}

const S = StyleSheet.create({
    container: { width: "100%" },
    tabs: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, justifyContent: 'center' },
    tab: { marginRight: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#2a2a2a" },
    tabActive: { backgroundColor: "#4b6cff" },
    tabText: { color: "#ddd", fontSize: 14 },
    tabTextActive: { color: "#fff", fontWeight: "600" },
    page: { paddingTop: 4, paddingBottom: 8 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 2,
        justifyContent: "center",
        backgroundColor: "#1f2937",
    },
    chipText: { color: "#fff", fontSize: 13.3 },
});
