import  React from 'react';
import {View, StyleSheet, Text} from "react-native";
import {Draggable, Droppable} from "@mgcrea/react-native-dnd";
import {Movement, MOVEMENT_LABEL} from "@/types/common";
import {colors} from "@/theme/theme";

export type TimelineSlotsProps = {
    steps: Movement[];
}

export function TimelineSlots({ steps }: TimelineSlotsProps) {
    return (
        <View style={{ padding: 12 }}>
            <View style={{ justifyContent: 'center' }}>
                <Text style={S.slotsTitle}>YOUR COMBO:</Text>
            </View>

            <View style={S.comboView}>

                
                {Array.from({ length: steps.length + 1 }).map((_, i) => (
                    <React.Fragment key={`seg-${i}`}>
                        <Droppable id={`slot-${i}`} data={{ index: i }}>
                            <View
                                style={S.dropSlots}
                                accessible
                                accessibilityLabel={`Insert at ${i}`}
                            >
                                <Text style={S.chainLink}>+</Text>
                            </View>
                        </Droppable>

                        {i < steps.length && (
                            <Draggable id={`step-${i}`} data={{ fromIndex: i }}>
                                <View
                                    style={S.sortableDrag}
                                    accessible
                                    accessibilityLabel={`Move ${steps[i]}`}
                                >
                                    <Text style={{ color: colors.background, fontWeight: '600' }}>{MOVEMENT_LABEL[steps[i]]}</Text>
                                </View>
                            </Draggable>
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    )
}

const S = StyleSheet.create({
    dropSlots: {
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sortableDrag: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#8e8af7',
    },
    comboView: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderWidth: .5,
        borderRadius: 15,
        borderColor: colors.offWhite,
        padding: 8
    },
    slotsTitle: {
        fontSize: 20,
        fontFamily: 'DMSansBold',
        color: colors.offWhite,
    },
    chainLink: {
        color: colors.offWhite,
        fontWeight: '600',
        fontSize: 20
    }
})
