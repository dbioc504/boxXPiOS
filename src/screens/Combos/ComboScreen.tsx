// ComboScreen.tsx
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {DndProvider} from '@/screens/Combos/DndComponents/DndProvider';
import type {Movement} from '@/types/common';
import {CombosDropListener} from "@/screens/Combos/DndComponents/CombosDropListener";
import {TimelineSlots} from "@/screens/Combos/TimelineSlots";
import {SafeAreaView} from "react-native-safe-area-context";
import {sharedStyle} from "@/theme/theme";
import {Header} from "@/theme/T";
import {MovementPalette} from "@/screens/Combos/MovementPalette";

export default function ComboScreen() {
    const initial: Movement[] = useMemo(
        () => [] as Movement[],
        []
    );
    const [steps, setSteps] = useState<Movement[]>(initial);
    const [editing, setEditing] = useState(false);

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='CREATE'/>
            <DndProvider>
                <CombosDropListener
                    stepsLen={steps.length}
                    onSwap={(a, b) => setSteps(cur => {
                        const next = cur.slice(); [next[a], next[b]] = [next[b], next[a]]; return next;
                    })}
                    onReorder={(from, to) => setSteps(cur => {
                        const next = cur.slice(); const [it] = next.splice(from, 1); next.splice(to, 0, it); return next;
                    })}
                    onInsertFromPalette={(moveKey, to) => {
                        setSteps(cur => {
                            const next = cur.slice();
                            next.splice(to, 0, moveKey as Movement);
                            return next;
                        });
                    }}
                />


                <View style={{flex: 1, paddingHorizontal: 12}}>

                    <MovementPalette />
                    {/* timeline */}
                    <TimelineSlots
                        steps={steps}
                        isEditing={editing}
                        onToggleEdit={() => setEditing(e => !e)}
                        onDeleteStep={(idx) => setSteps(cur => {
                            if (idx < 0 || idx >= cur.length) return cur;
                            const next = cur.slice();
                            next.splice(idx, 1);
                            return next;
                        })}
                    />

                </View>
            </DndProvider>
        </SafeAreaView>
    );
}
