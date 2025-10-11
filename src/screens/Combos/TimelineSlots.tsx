import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Droppable} from '@/screens/Combos/DndComponents/Droppable';
import {Draggable} from '@/screens/Combos/DndComponents/Draggable';
import type {Movement} from '@/types/common';
import {MOVEMENT_LABEL} from '@/types/common';
import {GhostAtOrigin} from "@/screens/Combos/DndComponents/GhostAtOrigin";
import {useSwapPreview} from "@/lib/hooks/useSwapPreview";
import {colors} from "@/theme/theme";

type Props = { steps: Movement[] };

export function TimelineSlots({ steps }: Props) {
    const { fromIndex, overIndex, targetIsChip } = useSwapPreview();
    const previewFromIndex = fromIndex;
    const previewOverIndex = overIndex;
    const previewTargetIsChip = targetIsChip;

    return (
        <View style={S.wrap}>
            <Text style={S.title}>YOUR COMBO</Text>
            <View style={S.row}>
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
                                <Draggable id={`chip-${i}`} style={S.chip}>
                                    <Text style={S.chipText}>{MOVEMENT_LABEL[steps[i]]}</Text>
                                </Draggable>

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
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    wrap: { padding: 8, borderColor: colors.offWhite, backgroundColor: colors.mainBtn,
        borderWidth: 2, borderRadius: 14, marginVertical: 8, height: 320, overflow: 'visible' },
    title: { fontSize: 18, fontWeight: '600', color: colors.offWhite, textAlign: 'left', marginBottom: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    slot: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    slotPlus: { color: '#cbd5e1', fontSize: 20, fontWeight: '700' },
    chipWrap: { position: 'relative' },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#8e8af7' },
    chipText: { color: '#0b0b2a', fontWeight: '600' },
    ghostChip: { },
    ghostText: { color: '#0b0b2a' }
});
