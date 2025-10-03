import React, { useMemo, useState } from "react";
import { View, Text, Pressable, useWindowDimensions, StyleSheet } from "react-native";
import { Draggable } from "@mgcrea/react-native-dnd";
import { PUNCHES, BODY_PUNCHES, DEFENSES, MOVEMENT_LABEL, type Movement } from "@/types/common";
import {CHIP_H, CHIP_W, GAP_X, GAP_Y} from "@/screens/Combos/ui";

const GROUPS = [
    { key: "punches", title: "PUNCHES", items: PUNCHES as Movement[] },
    { key: "body",    title: "BODY",    items: BODY_PUNCHES as Movement[] },
    { key: "defense", title: "DEFENSE", items: DEFENSES as Movement[] },
] as const;

export function MovementPalette() {
    return (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            {GROUPS.map((g) => (
                <View key={g.title} style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: '600', marginBottom: 8 }}>{g.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {g.items.map((m) => (
                            <Draggable key={m} id={`mv-${m}`} data={{ movement: m }}>
                                <View
                                    style={{
                                        width: CHIP_W,
                                        height: CHIP_H,
                                        marginRight: GAP_X,
                                        marginBottom: GAP_Y,
                                        borderRadius: 16,
                                        backgroundColor: '#1f2937',
                                        justifyContent: 'center',
                                        paddingHorizontal: 12
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 16 }}>{MOVEMENT_LABEL[m]}</Text>
                                </View>
                            </Draggable>
                        ))}
                    </View>
                </View>
                ))}
        </View>
    );
}