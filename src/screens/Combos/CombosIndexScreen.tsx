import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {Combo} from '@/types/combo';
import {ComboRow} from './ComboRow';
import {useNavigation} from '@react-navigation/native';
import {Header} from "@/theme/T";

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
        <View style={S.screen}>
            <Header title='COMBOS'/>

            <FlatList
                data={combos}
                keyExtractor={(c) => c.id}
                contentContainerStyle={{ padding: 12, gap: 12 }}
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
                <Pressable style={S.createBtn} onPress={() => nav.navigate('Combos')}>
                    <Text style={S.createText}>CREATE +</Text>
                </Pressable>
            </View>
        </View>
    )
}

const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0b0b2a' },
    header: {
        fontSize: 32, fontWeight: '900', color: '#fffd71', letterSpacing: 1,
        paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
    },
    footer: { padding: 16 },
    createBtn: {
        height: 56, borderRadius: 14, backgroundColor: '#d9d35b',
        alignItems: 'center', justifyContent: 'center',
    },
    createText: { color: '#0b0b2a', fontWeight: '900', fontSize: 22, letterSpacing: 0.5 },
});