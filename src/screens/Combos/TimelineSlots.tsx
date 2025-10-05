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
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: steps.length + 1 }).map((_, i) => (
                    <React.Fragment key={`seg-${i}`}>
                        <Droppable id={`slot-${i}`} data={{ index: i }}>
                            <View
                                style={S.dropSlots}
                                accessible
                                accessibilityLabel={`Insert at ${i}`}
                            >
                                <Text style={{ color: colors.offWhite }}>-</Text>
                            </View>
                        </Droppable>

                        {i < steps.length && (
                            <Draggable id={`step-${i}`} data={{ fromIndex: i }}>
                                <View
                                    style={S.sortableDrag}
                                    accessible
                                    accessibilityLabel={`Move ${steps[i]}`}
                                >
                                    <Text style={{ color: colors.offWhite }}>{MOVEMENT_LABEL[steps[i]]}</Text>
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
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#0f172a22',
        borderWidth: 1,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sortableDrag: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#334155',
        marginRight: 8
    }
})
