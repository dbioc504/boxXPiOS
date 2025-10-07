import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/theme/T';
import { DndProvider } from '@mgcrea/react-native-dnd';
import { scheduleOnRN } from 'react-native-worklets';
import { useComboBuilder } from '@/lib/hooks/useComboBuilder';
import { MovementPalette } from '@/screens/Combos/MovementPalette';
import { TimelineSlots } from '@/screens/Combos/TimelineSlots';
import type { Movement } from '@/types/common';
import {sharedStyle} from "@/theme/theme";

export default function ComboScreen() {
    const { steps, insertAt, move } = useComboBuilder();
    const [dragActive, setDragActive] = useState(false);

    return (
        <SafeAreaView style={[sharedStyle.safeArea, { flex: 1 }]}>
            <DndProvider
                onBegin={() => {
                    'worklet';
                    scheduleOnRN(setDragActive, true);
                }}
                onDragEnd={({ active, over }) => {
                    'worklet';
                    scheduleOnRN(setDragActive, false);
                    if (!over || !active) return;

                    const overData = (over as any).data?.value ?? (over as any).data;
                    const activeData = (active as any).data?.value ?? (active as any).data;

                    const dropIndex = overData?.index as number | undefined;
                    const fromIndex = activeData?.fromIndex as number | undefined;
                    const movement = activeData?.movement as Movement | undefined;

                    if (typeof dropIndex === 'number') {
                        if (typeof fromIndex === 'number') {
                            scheduleOnRN(move, fromIndex, dropIndex);
                        } else if (movement) {
                            scheduleOnRN(insertAt, movement, dropIndex);
                        }
                    }
                }}
            >
                <Header title='COMBOS'/>

                    <MovementPalette onPressChip={(m) => insertAt(m, steps.length)}/>
                    <TimelineSlots steps={steps} dragActive={dragActive}></TimelineSlots>
            </DndProvider>
        </SafeAreaView>
    );
}