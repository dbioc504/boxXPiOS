import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {Combo} from '@/types/combo';
import {ComboRow} from './ComboRow';
import {useNavigation} from '@react-navigation/native';
import {Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {SafeAreaView} from "react-native-safe-area-context";

export default function CombosIndexScreen() {
    const nav = useNavigation<any>();

    const seed= useMemo<Combo[]>(() => ([
        { id: 'c1', name: 'tick tick boom', category: "speed_and_power", steps: ['jab','jab','straight'] },
        { id: 'c2', name: 'rocking chair', category: "speed_and_power", steps: ['upjab', 'straight', 'upjab', 'straight'] }
    ]), []);
    const [combos, setCombos] = useState<Combo[]>(seed);
    const [openId, setOpenId] = useState<string | null>(null);

    const onToggle = (id: string) => setOpenId(prev => prev === id ? null : id);
    const onEdit = (id: string) => nav.navigate('Combos', { comboId: id });
    const onDelete = (id: string) => {
        setCombos(cur => cur.filter(c => c.id !== id));
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='COMBOS'/>

            <FlatList
                data={combos}
                keyExtractor={(c) => c.id}
                contentContainerStyle={{ padding: 12, gap: 4 }}
                renderItem={({ item }) => (
                    <ComboRow
                        combo={item}
                        expanded={openId === item.id}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            />

            <View style={S.footer}>
                <Pressable
                    style={({pressed}) => [
                        S.createBtn,
                        {opacity: (pressed ? 0.7 : 1)},
                        {backgroundColor: pressed ? colors.pressedBorder : colors.text}
                    ]}
                    onPress={() => nav.navigate('Combos')}
                >
                    <Text style={S.createText}>CREATE +</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const S = StyleSheet.create({
    footer: { padding: 16 },
    createBtn: {
        height: 56, borderRadius: 14, backgroundColor: colors.text,
        alignItems: 'center', justifyContent: 'center',
    },
    createText: {fontWeight: '600', fontSize: 22, letterSpacing: 0.5 },
});