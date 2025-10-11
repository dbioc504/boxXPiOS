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

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='COMBOS'/>
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
                    {/* header and your mockup UI go here */}

                    <MovementPalette />
                    {/* timeline */}
                    <TimelineSlots steps={steps}/>

                    {/* simple palette sample to prove the id contract */}
                    {/*<View style={{marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>*/}
                    {/*    {palette.map((mv, i) => (*/}
                    {/*        <Draggable key={mv} id={`palette:${mv}`}>*/}
                    {/*            <View style={{*/}
                    {/*                paddingVertical: 6,*/}
                    {/*                paddingHorizontal: 10,*/}
                    {/*                borderRadius: 10,*/}
                    {/*                backgroundColor: '#64748b'*/}
                    {/*            }}>*/}
                    {/*                <Text style={{color: 'white', fontWeight: '600'}}>{mv}</Text>*/}
                    {/*            </View>*/}
                    {/*        </Draggable>*/}
                    {/*    ))}*/}
                    {/*</View>*/}
                </View>
            </DndProvider>
        </SafeAreaView>
    );
}
