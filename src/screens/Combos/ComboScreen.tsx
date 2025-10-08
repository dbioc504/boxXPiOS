import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {sharedStyle} from "@/theme/theme";
import TimelineSlotsPlayground from "@/screens/Combos/TimelineSlotsPlayground";

export default function ComboScreen() {

    return (
        <SafeAreaView style={[sharedStyle.safeArea, { flex: 1 }]}>
            <TimelineSlotsPlayground/>
        </SafeAreaView>
    );
}