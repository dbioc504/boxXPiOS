// src/screens/Combos/ComboScreen.tsx (only the inner component shown)
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Header} from "@/theme/T";
import {DndProvider} from "@mgcrea/react-native-dnd";
import {sharedStyle} from "@/theme/theme";
import {MovementPalette} from "@/screens/Combos/MovementPalette";
import {TimelineSlots} from "@/screens/Combos/TimelineSlots";
import {scheduleOnRN} from "react-native-worklets";
import {ScrollView} from "react-native";
import {useComboBuilder} from "@/lib/hooks/useComboBuilder";

export default function ComboScreen() {
    const { steps, insertAt, move } = useComboBuilder();

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <ScrollView>
                <Header title={'COMBOS'}/>
                <DndProvider
                    onDragEnd={({ active, over }) => {
                        'worklet';
                        if (!over || !active) return;
                        const overData = (over as any).data?.value ?? (over as any).data;
                        const activeData = (active as any).data?.value ?? (active as any).data;

                        const dropIndex = overData?.index as number | undefined;
                        const fromIndex = activeData?.fromIndex as number | undefined;
                        const movement = activeData?.movement;
                        if (typeof dropIndex === 'number') {
                            if (typeof fromIndex === 'number') {
                                scheduleOnRN(move, fromIndex, dropIndex);
                            } else if (movement) {
                                scheduleOnRN(insertAt, movement, dropIndex);
                            }
                        }
                    }}
                >
                    <MovementPalette onPressChip={(m) => insertAt(m, steps.length)}></MovementPalette>
                    <TimelineSlots steps={steps}/>
                </DndProvider>
            </ScrollView>
        </SafeAreaView>
    );
}