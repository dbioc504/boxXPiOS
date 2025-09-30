import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, NativeScrollEvent,
            NativeSyntheticEvent, LayoutChangeEvent, StyleSheet } from "react-native";
import { PUNCHES, BODY_PUNCHES, DEFENSES, MOVEMENT_LABEL, type Movement } from "@/types/common";

const GROUPS = [
    { key: 'punches', title: 'Punches', items: PUNCHES as Movement[] },
    { key: 'body', title: 'Body', items: BODY_PUNCHES as Movement[] },
    { key: 'defense', title: 'Defense', items: DEFENSES as Movement[] },
] as const;

type Props = {
    getPanHandlers? : (m: Movement) => Record<string, unknown>;
    onPressChip?: (m: Movement) => void;
    rows?: number;
    chipMinWidth?: number;
    chipGap?: number;
    contentPadding?: number;
};

export default function MovementPalette({
    getPanHandlers,
    onPressChip,
    rows = 3,
    chipMinWidth = 96,
    chipGap = 8,
    contentPadding = 12
}: Props) {
    const [activeGroup, setActiveGroup] = useState(0);
    const [panelWidth, setPanelWidth] = useState(0);
    const pagesListRef = useRef<FlatList<Movement[]> | null>(null);
    const [pageIndex, setPageIndex] = useState(0);

    const onPanelLayout = (e: LayoutChangeEvent) => {
        setPanelWidth(Math.floor(e.nativeEvent.layout.width));
    };

    const columns = useMemo(() => {
        if (panelWidth <= 0) return 1;
        const usable = panelWidth - contentPadding * 2;
        const per = chipMinWidth + chipGap;
        return Math.max(1, Math.floor((usable + chipGap) / per));
    }, [panelWidth, chipMinWidth, chipGap, contentPadding]);

    const chipWidth = useMemo(() => {
        if (panelWidth <= 0) return chipMinWidth;
        const usable = panelWidth - contentPadding * 2 - chipGap * (columns - 1);
        return Math.floor(usable / columns);
    }, [panelWidth, columns, chipGap, contentPadding, chipMinWidth]);

    const perPage = Math.max(1, rows * columns);

    const chunk = (arr: Movement[], size: number) => {
        const out: Movement[][] = [];
        for (let i=0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    }

    const pages = useMemo(() => {
        const items = GROUPS[activeGroup].items;
        return chunk(items, perPage);
    }, [activeGroup, perPage]);

    const goToPage = useCallback((idx: number) =>{
        setPageIndex(idx);
        pagesListRef.current?.scrollToIndex({ index: idx, animated: true });
    }, []);

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const w = panelWidth || 1;
        const idx = Math.round(x / w);
        if (idx !== pageIndex) setPageIndex(idx);
    };

    const onTabPress = (i: number) => {
        setActiveGroup(i);
        setPageIndex(0);
        requestAnimationFrame(() => goToPage(0));
    };

    const renderPage = ({ item }: { item: Movement[] }) => (
        <View style={[styles.page, { width: panelWidth, paddingHorizontal: contentPadding }]}>
            <View style={[styles.grid, { gap: chipGap }]}>
                {item.map((m) => {
                    const pan = getPanHandlers ? getPanHandlers(m): {};
                    return (
                        <Pressable
                            key={m}
                            {...pan}
                            onPress={onPressChip ? () => onPressChip(m): undefined}
                            accessibilityRole='button'
                            accessibilityLabel={MOVEMENT_LABEL[m]}
                            hitSlop={8}
                            style={[styles.chip, { width: chipWidth }]}
                        >
                            <Text style={styles.chipText}>{MOVEMENT_LABEL[m]}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    )

    return (
        <View onLayout={onPanelLayout} style={styles.container}>
            {/*  Tabs  */}
            <View style={styles.tabs}>
                {GROUPS.map((g, i) => {
                    const active = i === activeGroup;
                    return (
                        <Pressable
                            key={g.key}
                            onPress={() => onTabPress(i)}
                            accessibilityRole='button'
                            style={[styles.tab, active && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, active && styles.tabTextActive]}>{g.title}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/*  Horizontal pages with no inner scroll  */}
            <FlatList
                ref={pagesListRef}
                data={pages}
                keyExtractor={(_, i) => `page-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderPage}
                onMomentumScrollEnd={onMomentumEnd}
                getItemLayout={(_, index) => ({ length: panelWidth, offset: panelWidth * index, index })}
            >
            </FlatList>
        </View>


    )
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 8
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
    },
    tabActive: {
        backgroundColor: '#4b6cff'
    },
    tabText: { color: '#ddd', fontSize: 14 },
    tabTextActive: { color: '#fff', fontWeight: '600' },
    page: { paddingTop: 4, paddingBottom: 8 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    chip: {
        marginBottom: 8,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#1f2937'
    },
    chipText: { color: '#fff', fontSize: 14 }
})