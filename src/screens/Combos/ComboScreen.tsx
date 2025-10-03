// src/screens/Combos/ComboScreen.tsx (only the inner component shown)
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/theme/T";
import { DndProvider, type DndProviderProps } from "@mgcrea/react-native-dnd";
import type { Movement } from "@/types/common";
import { sharedStyle } from "@/theme/theme";
import {MovementPalette} from "@/screens/Combos/MovementPalette";
import {TimelineSlots} from "@/screens/Combos/TimelineSlots";
import { scheduleOnRN} from "react-native-worklets";
import {ScrollView, View, Text} from "react-native";

export default function ComboScreen() {
    const [steps, setSteps] = useState<Movement[]>([]);

    const handleInsert = (mv: Movement, idx: number) => {
        setSteps(prev => {
            const next = [...prev];
            const clamped = Math.max(0, Math.min(idx, next.length));
            next.splice(clamped, 0, mv);
            return next;
        });
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <ScrollView>
                <Header title={'COMBOS'}/>
                <DndProvider
                    onDragEnd={({ active, over }) => {
                        'worklet';
                        if (!over) return;
                        const idx = over?.data?.value?.index;
                        const mv = active?.data?.value?.movement;
                        if (typeof idx === 'number' && mv) {
                            scheduleOnRN(handleInsert, mv, idx);
                        }
                    }}
                >
                    <MovementPalette />
                    <TimelineSlots count={steps.length + 1} onInsert={() => {}}/>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, paddingBottom: 12 }}>
                        {steps.map((m, i) => (
                            <View key={`${m}-${i}`} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#334155", marginRight: 6, marginBottom: 6 }}>
                                <Text style={{ color: "white" }}>{m}</Text>
                            </View>
                        ))}
                    </View>
                </DndProvider>
            </ScrollView>
        </SafeAreaView>
    );
}