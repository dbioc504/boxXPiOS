import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Draggable} from '@/screens/Combos/DndComponents/Draggable';
import type {Movement} from '@/types/common';
import {BODY_PUNCHES, DEFENSES, MOVEMENT_LABEL, PUNCHES} from '@/types/common';
import {colors} from "@/theme/theme";
import {useDnd} from "@/screens/Combos/DndComponents/DndProvider";
import Animated, {useAnimatedStyle} from "react-native-reanimated";

export type PaletteCategory = 'punches' | 'body' | 'defense';

const CATEGORY_MAP: Record<PaletteCategory, Movement[]> = {
    punches: PUNCHES,
    body: BODY_PUNCHES,
    defense: DEFENSES
};

const CATEGORY_TITLE: Record<PaletteCategory, string> = {
    punches: 'PUNCHES',
    body: 'BODY PUNCHES',
    defense: 'DEFENSE'
};

function TabButton({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[ S.tabBtn, active ? S.tabOn : S.tabOff ]}>
            <Text style={[S.tabText, active ? S.tabTextOn : S.tabTextOff]}>{label}</Text>
        </Pressable>
    )
}

export function MovementPalette({
    initialCategory = 'punches' as PaletteCategory,
    onCategoryChange
}: {
    initialCategory?: PaletteCategory;
    onCategoryChange?: (c: PaletteCategory) => void;
}) {
    const { activeDragId } = useDnd();
    const aWrap = useAnimatedStyle(() => {
        const dragId = activeDragId.value ?? '';
        const paletteDragging = dragId.startsWith('palette:');
        return {
            zIndex: paletteDragging ? 1000 : 0,
            elevation: paletteDragging ? 1000 : 0
        };
    });

    const [category, setCategory] = useState<PaletteCategory>(initialCategory);
    const items = useMemo(() => CATEGORY_MAP[category], [category]);

    const setCat = (c: PaletteCategory)=> {
        setCategory(c);
        onCategoryChange?.(c);
    };

    return (
        <Animated.View style={[S.wrap, aWrap]}>
            <Text style={S.title}>{CATEGORY_TITLE[category]}</Text>

            <View style={S.tabs}>
                <TabButton label="Punches" active={category === 'punches'} onPress={() => setCat('punches')}/>
                <TabButton label="Body" active={category === 'body'} onPress={() => setCat('body')}/>
                <TabButton label="Defense" active={category === 'defense'} onPress={() => setCat('defense')}/>
            </View>

            <View style={S.grid}>
                {items.map((mv) => (
                    <Draggable key={mv} id={`palette:${mv}`} style={S.chip} >
                        <Text style={S.chipText}>{MOVEMENT_LABEL[mv]}</Text>
                    </Draggable>
                ))}
            </View>
        </Animated.View>
    );
}

const S = StyleSheet.create({
    wrap: { padding: 8, backgroundColor: colors.mainBtn, borderRadius: 14, borderWidth: 2,
        borderColor: colors.offWhite, overflow: 'visible' },
    title: { color: colors.offWhite, fontWeight: '600', fontSize: 18, textAlign: 'center', marginBottom: 8 },
    tabs: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
    tabBtn: { paddingHorizontal: 12, height: 28, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    tabOn: { backgroundColor: colors.text },
    tabOff: { backgroundColor: '#1f2a44' },
    tabText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
    tabTextOn: { color: colors.mainBtn },
    tabTextOff: { color: '#a3b1c9' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 8, paddingBottom: 4 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#8e8af7' },
    chipText: { color: colors.mainBtn, fontWeight: '700' },
});