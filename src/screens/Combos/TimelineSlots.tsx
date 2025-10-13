import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Alert,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {Droppable} from '@/screens/Combos/DndComponents/Droppable';
import {Draggable} from '@/screens/Combos/DndComponents/Draggable';
import type {Movement} from '@/types/common';
import {MOVEMENT_LABEL} from '@/types/common';
import {GhostAtOrigin} from "@/screens/Combos/DndComponents/GhostAtOrigin";
import {useSwapPreview} from "@/lib/hooks/useSwapPreview";
import {colors} from "@/theme/theme";
import {Ionicons} from "@expo/vector-icons";

type Props = {
    steps: Movement[]
    isEditing?: boolean;
    onToggleEdit?: () => void;
    onDeleteStep?: (index: number) => void;
};

export function TimelineSlots({ steps, isEditing = false, onToggleEdit, onDeleteStep }: Props) {
    const { fromIndex, overIndex, targetIsChip } = useSwapPreview();
    const previewFromIndex = fromIndex;
    const previewOverIndex = overIndex;
    const previewTargetIsChip = targetIsChip && !isEditing;

    const scrollerRef = useRef<ScrollView>(null);

    const [viewportH, setViewPortH] = useState(0);
    const [contentH, setContentH] = useState(0);
    const scrollYRef = useRef(0);

    const repeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const delayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopRepeat = useCallback(() => {
        if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
        if (repeatTimerRef.current) { clearInterval(repeatTimerRef.current); repeatTimerRef.current = null; }
    }, []);

    useEffect(() => stopRepeat, [stopRepeat]);

    const scrollBy = useCallback((dy: number) => {
        const maxY = Math.max(0, contentH - viewportH);
        const nextY = Math.max(0, Math.min(maxY, scrollYRef.current + dy));
        scrollerRef.current?.scrollTo({ y: nextY, animated: true });
        scrollYRef.current = nextY;
    }, [contentH, viewportH]);

    const startRepeat = useCallback((dir: 1 | -1, step: number) => {
        stopRepeat();
        scrollBy(dir * step);
        delayTimerRef.current = setTimeout(() => {
            repeatTimerRef.current = setInterval(() => {
                scrollBy(dir * step);
            }, 80);
        }, 250);
    }, [scrollBy, stopRepeat]);

    useEffect(() => {
        scrollerRef.current?.scrollToEnd({ animated: false });
        scrollYRef.current = Math.max(0, contentH - viewportH);
    }, [steps.length, contentH, viewportH]);

    const onContentSizeChange = useCallback((w: number, h: number) => {
        setContentH(h);
    }, []);

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollYRef.current = e.nativeEvent.contentOffset.y;
    }, []);

    const pageStep = Math.max(60, Math.floor(viewportH * 0.6));

    return (
        <View style={S.wrap}>
            <View style={S.titleHeader}>
                <Text style={S.title}>YOUR COMBO</Text>

                <View style={S.rightHeader}>
                    <View style={S.controls}>
                        <Pressable
                            onPress={() => scrollBy(-pageStep)}
                            onPressIn={() => startRepeat(-1, pageStep)}
                            onPressOut={stopRepeat}
                            hitSlop={12}
                            style={({pressed}) => [S.ctrlBtn, pressed && S.ctrlPressed]}
                        >
                            <Text style={S.ctrlText}>▲</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => scrollBy(pageStep)}
                            onPressIn={() => startRepeat(1, pageStep)}
                            onPressOut={stopRepeat}
                            hitSlop={12}
                            style={({pressed}) => [S.ctrlBtn, pressed && S.ctrlPressed]}
                        >
                            <Text style={S.ctrlText}>▼</Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={onToggleEdit} hitSlop={8} style={S.editBtn}>
                        <Ionicons
                            name={isEditing ? 'checkmark-circle-outline' : 'create-outline'}
                            size={18}
                            color={colors.offWhite}
                        />
                        <Text style={S.editText}>{isEditing ? 'DONE' : 'EDIT'}</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                ref={scrollerRef}
                scrollEnabled={isEditing}
                onContentSizeChange={onContentSizeChange}
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator
                contentContainerStyle={S.row}
            >
                {Array.from({ length: steps.length + 1 }).map((_, i) => (
                    <React.Fragment key={`frag-${i}`}>
                        <Droppable
                            key={`slot-${i}`}
                            id={`slot-${i}`}
                            edgeOnly={i === 0 || i === steps.length}
                            style={S.slot}
                            overBorderColor="#4b6cff"
                            idleBorderColor="#334155"
                            overBg="rgba(75,108,255,0.25)"
                            idleBg="rgba(15,23,42,0.13)"
                        >
                            <Text style={S.slotPlus}>+</Text>
                        </Droppable>

                        {i < steps.length && (
                            <View key={`chipwrap-${i}`} style={S.chipWrap}>
                                {isEditing ? (
                                    <View style={[S.chip, S.chipRow]}>
                                        <Text style={S.chipText}>{MOVEMENT_LABEL[steps[i]]}</Text>
                                        <Pressable
                                            hitSlop={10}
                                            style={S.delBtn}
                                            onPress={() => {
                                                const label = MOVEMENT_LABEL[steps[i]];
                                                Alert.alert(
                                                    'Remove step',
                                                    `Delete "${label}" from this combo?`,
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        { text: 'Delete', style: 'destructive', onPress: () => onDeleteStep?.(i) },
                                                    ],
                                                    { cancelable: true }
                                                );
                                            }}
                                        >
                                            <View style={{ borderRadius: 999, borderWidth: 2, borderColor: colors.mainBtn }}>
                                                <Ionicons name='close' size={16} color={colors.mainBtn}/>
                                            </View>
                                        </Pressable>
                                    </View>
                                    ) : (
                                        <Draggable id={`chip-${i}`} style={S.chip}>
                                            <Text style={S.chipText}>{MOVEMENT_LABEL[steps[i]]}</Text>
                                        </Draggable>
                                )}

                                {previewTargetIsChip && previewFromIndex === i && previewOverIndex != null && (
                                    <GhostAtOrigin
                                        originIndex={i}
                                        hoveredIndex={previewOverIndex}
                                        renderChip={(idx) => (
                                            <View style={[S.chip, S.ghostChip]}>
                                                <Text style={[S.chipText, S.ghostText]}>{MOVEMENT_LABEL[steps[idx]]}</Text>
                                            </View>
                                        )}
                                    />
                                )}
                            </View>
                        )}
                    </React.Fragment>
                ))}
            </ScrollView>
        </View>
    );
}

const S = StyleSheet.create({
    wrap: {
        padding: 8,
        borderColor: colors.offWhite,
        backgroundColor: colors.mainBtn,
        borderWidth: 2,
        borderRadius: 14,
        marginVertical: 8,
        height: 320,
        overflow: 'hidden',
    },
    titleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: '600', color: colors.offWhite, flex: 1 },
    rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    controls: { flexDirection: 'row', gap: 8, marginRight: 6 },
    ctrlBtn: {
        width: 32, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.offWhite,
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2a44',
    },
    ctrlPressed: { opacity: 0.7 },
    ctrlText: { color: colors.offWhite, fontWeight: '800', fontSize: 14 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, height: 28, borderRadius: 8, borderWidth: 2,
        borderColor: colors.offWhite, backgroundColor: '#1f2a44'
    },
    editText: { color: colors.offWhite, fontWeight: '600', fontSize: 12, letterSpacing: 0.3 },
    viewport: { flex: 1 },
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignContent: 'flex-start', gap: 8, paddingBottom: 8 },
    slot: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    slotPlus: { color: '#cbd5e1', fontSize: 20, fontWeight: '700' },
    chipWrap: { position: 'relative' },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#8e8af7' },
    chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chipText: { color: '#0b0b2a', fontWeight: '600' },
    delBtn: {
        width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
    },
    ghostChip: {},
    ghostText: { color: '#0b0b2a' },
});
