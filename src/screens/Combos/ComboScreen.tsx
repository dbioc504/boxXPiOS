// ComboScreen.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Modal, Pressable, View} from 'react-native';
import {DndProvider} from '@/screens/Combos/DndComponents/DndProvider';
import {Category, CATEGORY_LABEL, Movement} from '@/types/common';
import {CombosDropListener} from "@/screens/Combos/DndComponents/CombosDropListener";
import {TimelineSlots} from "@/screens/Combos/TimelineSlots";
import {SafeAreaView} from "react-native-safe-area-context";
import {sharedStyle} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import {MovementPalette} from "@/screens/Combos/MovementPalette";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";
import {useNavigation, useRoute} from "@react-navigation/native";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";

type RouteProps = NativeStackScreenProps<RootStackParamList, 'Combos'>['route'];
type NavProps = NativeStackScreenProps<RootStackParamList, 'Combos'>['navigation'];

export default function ComboScreen() {
    const savingRef = useRef<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const saveTimer = useRef<NodeJS.Timeout>(null);

    const initial: Movement[] = useMemo(
        () => [] as Movement[],
        []
    );
    const route = useRoute<RouteProps>();
    const nav = useNavigation<NavProps>();
    const repo = useCombosRepo();
    const userId = 'demo';

    const comboId = route.params?.comboId ?? null;

    const [steps, setSteps] = useState<Movement[]>(initial);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(comboId ? 'EDIT' : 'CREATE');
    const [loading, setLoading] = useState(false);

    const [saveOpen, setSaveOpen] = useState(false);
    const [name, setName] = useState<string>('');
    const [category, setCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let alive = true;
        const loadMeta = async () => {
            if (!comboId) return;
            const res = await repo.getCombo(userId, comboId);
            if (!alive || !res) return;
            setName(res.meta.name ?? '');
            setCategory((res.meta.category as Category) ?? null);
        };
        loadMeta();
        return () => { alive = false; };
    }, [comboId, repo, userId]);

    const onOpenSave = () => setSaveOpen(true);
    const onCloseSave = () => setSaveOpen(false);

    const onConfirmSave = async () => {
        try {
            setSaving(true);
            if (!comboId) {
                setSaving(false);
                setSaveOpen(false);
                nav.goBack();
            } else {
                if (name) await repo.renameCombo(userId, comboId, name);
                setSaving(false);
                setSaveOpen(false);
                nav.goBack();
            }
        } catch (e) {
            setSaveOpen(false);
            Alert.alert('Save failed', 'Please try again');
        }
    };

    useEffect(() => {
        if (!comboId) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);

        savingRef.current = 'saving';

        saveTimer.current = setTimeout(async () => {
            try {
                await repo.saveSteps(userId, comboId, steps);
                savingRef.current = 'saved';
            } catch (e) {
                savingRef.current = 'error';
            }
        }, 500);

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [steps, comboId, repo, userId]);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            if (!comboId) {
                setSteps([]);
                setTitle('CREATE');
                return;
            }
            setLoading(true);
            const res = await repo.getCombo(userId, comboId);
            if (!alive) return;

            if (!res) {
                Alert.alert('Combo not found', 'This combo may have been deleted.', [
                    { text: 'OK', onPress: () => nav.goBack() }
                ]);
                return;
            }

            setSteps(res.steps);
            setTitle(res.meta.name || 'EDIT');
            setLoading(false);
        };

        load();
        return () => { alive = false; };
    }, [comboId, repo, nav]);

    // @ts-ignore
    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title={title} />
            <DndProvider>
                {/* disable handling while loading just in case */}
                {!loading && (
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
                )}

                <View style={{flex: 1, paddingHorizontal: 12}}>
                    <MovementPalette />
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

            <View style={{ padding: 12 }}>
                <Pressable
                    disabled={saving}
                    onPress={onOpenSave}
                    style={({pressed}) => ({
                        height: 56, borderRadius: 14,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pressed ? '#2a3555' : '#3b4a76'
                    })}
                >
                    <BodyText style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
                        {comboId ? 'Save' : 'Create'}
                    </BodyText>
                </Pressable>
            </View>

            <Modal visible={saveOpen} transparent animationType="fade" onRequestClose={onCloseSave}>
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 }}>
                    <View style={{ backgroundColor:'#0b0b2a', borderRadius:12, padding:16, borderWidth:2, borderColor:'#fff' }}>
                        <BodyText style={{ color:'#fff', fontWeight:'700', fontSize:18, marginBottom:12 }}>
                            {comboId ? 'Save Combo' : 'Create Combo'}
                        </BodyText>

                        {/* Name input */}
                        {/* Replace with your themed TextInput */}
                        <View style={{ borderWidth:1, borderColor:'#445', borderRadius:8, paddingHorizontal:10, marginBottom:12 }}>
                            <BodyText style={{ color:'#9ab', marginTop:6 }}>Name (optional)</BodyText>
                            {/* Your TextInput here to bind `name` */}
                        </View>

                        {/* Category picker (simple buttons or your selector) */}
                        <BodyText style={{ color:'#9ab', marginBottom:6 }}>Category (optional)</BodyText>
                        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                                <Pressable
                                    key={key}
                                    onPress={() => setCategory(key as Category)}
                                    style={{
                                        paddingHorizontal:10, height:32, borderRadius:8, borderWidth:2,
                                        borderColor: category === key ? '#fff' : '#445',
                                        alignItems:'center', justifyContent:'center'
                                    }}
                                >
                                    <BodyText style={{ color:'#fff' }}>{label}</BodyText>
                                </Pressable>
                            ))}
                            <Pressable onPress={() => setCategory(null)} style={{
                                paddingHorizontal:10, height:32, borderRadius:8, borderWidth:2,
                                borderColor: category == null ? '#fff' : '#445',
                                alignItems:'center', justifyContent:'center'
                            }}>
                                <BodyText style={{ color:'#fff' }}>None</BodyText>
                            </Pressable>
                        </View>

                        <View style={{ flexDirection:'row', gap:8, justifyContent:'flex-end' }}>
                            <Pressable onPress={onCloseSave} disabled={saving} style={{ paddingHorizontal:12, height:36, borderRadius:8, borderWidth:2, borderColor:'#fff', alignItems:'center', justifyContent:'center' }}>
                                <BodyText style={{ color:'#fff' }}>Cancel</BodyText>
                            </Pressable>
                            <Pressable onPress={onConfirmSave} disabled={saving} style={{ paddingHorizontal:12, height:36, borderRadius:8, borderWidth:2, borderColor:'#fff', backgroundColor:'#1f2a44', alignItems:'center', justifyContent:'center' }}>
                                <BodyText style={{ color:'#fff', fontWeight:'700' }}>{saving ? 'Saving…' : (comboId ? 'Save' : 'Create')}</BodyText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
