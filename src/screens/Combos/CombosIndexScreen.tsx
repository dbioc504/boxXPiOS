import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {ComboRow} from './ComboRow';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {SafeAreaView} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";
import {ComboMeta} from "@/lib/repos/combos.repo";

export default function CombosIndexScreen() {
    const nav = useNavigation<NativeStackScreenProps<RootStackParamList, 'CombosIndex'>['navigation']>();
    const repo = useCombosRepo();
    const userId = 'demo';

    const [combos, setCombos] = useState<ComboMeta[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);

    const load = useCallback(async () => {
        const list = await repo.listCombos(userId);
        setCombos(list);
    }, [repo,userId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    )

    const onToggle = (id: string) => setOpenId(prev => prev === id ? null : id);
    const onEdit = (id: string) => nav.navigate('Combos', { comboId: id });
    const onDelete = async (id: string) => {
        await repo.deleteCombo(userId, id);
        if (openId === id) setOpenId(null);
        await load();
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
                        meta={item}
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