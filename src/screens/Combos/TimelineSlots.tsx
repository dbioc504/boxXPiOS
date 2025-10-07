import React from 'react';
import {View, StyleSheet, Text} from "react-native";
import {Movement, MOVEMENT_LABEL} from "@/types/common";
import {colors} from "@/theme/theme";
import {DnDDraggable, DnDDroppable} from "@/screens/Combos/DnDPrimitives";

type TimelineSlotsProps = {
    steps: Movement[];
    dragActive?: boolean
};

export function TimelineSlots({ steps, dragActive = false }: TimelineSlotsProps){
    return (
        <DnDDroppable
            id='timeline-container'
            data={{ index: steps.length }}
            animatedStyleWorklet={(s, isOver) => {
                'worklet';
                return { ...s, borderWidth: 1, borderRadius: 12, borderColor: isOver ? '#4b6cff' : 'transparent' };
            }}
        >
            <View style={S.wrap}>
                {dragActive && <View pointerEvents='none' style={S.overlay}/>}

                <View style={{ justifyContent: 'center' }}>
                    <Text style={S.slotsTitle}>YOUR COMBO:</Text>
                </View>

                <View style={S.comboView}>
                    {Array.from({ length: steps.length + 1 }).map((_, i) => (
                        <React.Fragment key={`seg-${i}`}>
                            <DnDDroppable
                                id={`slot-${i}`}
                                data={{ index: i }}
                                animatedStyleWorklet={(s, isOver) => {
                                    'worklet';
                                    return {
                                        ...s,
                                        backgroundColor: isOver ? 'rgba(80,140,255,0.25)' : 'rgba(15,23,42,0.13)',
                                        borderColor: isOver ? '#4b6cff' : '#334155',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                    };
                                }}
                            >
                                <View style={S.linkSlot} accessible accessibilityLabel={`Insert at ${i}`}>
                                    <Text style={S.chainLink}>+</Text>
                                </View>
                            </DnDDroppable>

                            {i < steps.length && (
                                <DnDDraggable
                                    id={`step-${i}`}
                                    data={{ fromIndex: i }}
                                    animatedStyleWorklet={(s, isActive) => {
                                        'worklet';
                                        return { ...s, zIndex: isActive ? 999 : 0, transform: [{ scale: isActive ? 1.02 : 1 }] };
                                    }}
                                >
                                    <View style={S.chip} accessible accessibilityLabel={`Move ${steps[i]}`}>
                                        <Text style={S.chipText}>{MOVEMENT_LABEL[steps[i]]}</Text>
                                    </View>
                                </DnDDraggable>
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </DnDDroppable>
    )
}

const S = StyleSheet.create({
    wrap: {
        padding: 12,
        borderRadius: 12,
        overflow: 'hidden'
    },
    overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(75,108,255,0.06)'},
    comboView: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderWidth: 0.5,
        borderRadius: 15,
        borderColor: colors.offWhite,
        padding: 8
    },
    linkSlot: {
        width: 44,
        height: 44,
        borderRadius: 10,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#8e8af7'
    },
    chipText: {color: colors.background, fontWeight: '600'},
    slotsTitle: {fontSize: 20, fontFamily: 'DMSansBold', color: colors.offWhite},
    chainLink: {color: colors.offWhite, fontWeight: '600', fontSize: 20},
});
