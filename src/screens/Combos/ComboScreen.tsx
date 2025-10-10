// ComboScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { DndProvider } from '@/screens/Combos/DndComponents/DndProvider';
import type { Movement } from '@/types/common';
import { Draggable } from "./DndComponents/Draggable";
import {CombosDropListener} from "@/screens/Combos/DndComponents/CombosDropListener";
import {TimelineSlots} from "@/screens/Combos/TimelineSlots";
import {SafeAreaView} from "react-native-safe-area-context";
import {sharedStyle} from "@/theme/theme";
import {Header} from "@/theme/T";

function move<T>(arr: T[], from: number, to: number): T[] {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

function swap<T>(arr: T[], a: number, b: number): T[] {
    if (a === b) return arr;
    const next = arr.slice();
    [next[a], next[b]] = [next[b], next[a]];
    return next;
}

export default function ComboScreen() {
    const initial: Movement[] = useMemo(
        () => ['jab', 'straight', 'left_hook'] as Movement[],
        []
    );
    const [steps, setSteps] = useState<Movement[]>(initial);

    // optional sample palette state
    const [palette] = useState<Movement[]>([
        'right_uppercut',
        'left_uppercut',
        'overhand',
    ] as Movement[]);

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='COMBOS'/>
            <DndProvider>
                <CombosDropListener
                    stepsLen={steps.length}
                    onSwap={(a, b) => setSteps(cur => swap(cur, a, b))}
                    onReorder={(from, to) => setSteps(cur => move(cur, from, to))}
                    onInsertFromPalette={(moveKey, to) =>
                        setSteps(cur => {
                            const next = cur.slice();
                            if (to === 0) return [moveKey as Movement, ...next];
                            if (to === next.length) return [...next, moveKey as Movement];
                            return next;
                        })
                    }
                />

                <View style={{flex: 1, padding: 16}}>
                    {/* header and your mockup UI go here */}

                    {/* timeline */}
                    <TimelineSlots steps={steps}/>

                    {/* simple palette sample to prove the id contract */}
                    <View style={{marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                        {palette.map((mv, i) => (
                            <Draggable key={mv} id={`palette:${mv}`}>
                                <View style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 10,
                                    backgroundColor: '#64748b'
                                }}>
                                    <Text style={{color: 'white', fontWeight: '600'}}>{mv}</Text>
                                </View>
                            </Draggable>
                        ))}
                    </View>
                </View>
            </DndProvider>
        </SafeAreaView>
    );
}
