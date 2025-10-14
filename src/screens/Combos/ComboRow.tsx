import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {ExpandableSection} from '@/screens/Skills/ExpandableSection';
import {CATEGORY_LABEL, type Movement, MOVEMENT_LABEL} from '@/types/common';
import {colors} from '@/theme/theme';
import {ComboMeta} from "@/lib/repos/combos.repo";
import {useCombosRepo} from "@/lib/repos/CombosRepoContext";

const nameFromSteps = (steps: Movement[]) =>
    steps.slice(0, 3).map(s => MOVEMENT_LABEL[s]).join(' - ') || 'Untitled';

function toTitleCase(str) {
    if (!str) return str;

    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

type Props = {
    meta: ComboMeta;
    expanded: boolean;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export function ComboRow({ meta, expanded, onToggle, onEdit, onDelete }: Props) {
    const repo = useCombosRepo();
    const userId = 'demo';

    const [steps, setSteps] = useState<Movement[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!expanded || steps !== null || loading) return;
            setLoading(true);
            try {
                const data = await repo.getCombo(userId, meta.id);
                if (alive) setSteps(data?.steps ?? []);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [expanded, steps, loading, repo, userId, meta.id]);

    const derivedTitle = meta.name?.trim()
        ? meta.name
        : (steps ? nameFromSteps(steps) : 'Untitled');

    const title = toTitleCase(derivedTitle);

    return (
        <ExpandableSection
            id={meta.id}
            title={toTitleCase(title)}
            expanded={expanded}
            onToggle={onToggle}
            isStyleCard={false}
            showRadio={false}
        >
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{color: colors.text, fontSize: 18, textAlign: 'center'}}>Category:</Text>
                <Text style={{color: colors.text, fontSize: 18, textAlign: 'center'}}>
                    {meta.category ? CATEGORY_LABEL[meta.category] : 'None'}
                </Text>
            </View>

            {/* Chips preview */}
            {loading && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator color={colors.offWhite} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            {!loading && steps && (
                <View style={styles.chipsWrap}>
                    {steps.map((mv, i) => (
                        <View key={`${meta.id}-${i}`} style={styles.chip}>
                            <Text style={styles.chipText}>{MOVEMENT_LABEL[mv]}</Text>
                        </View>
                    ))}
                    {steps.length === 0 && (
                        <Text style={styles.emptyText}>No steps yet.</Text>
                    )}
                </View>
            )}

            {/*  Row  */}
            <View style={styles.actionsRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionBtn,
                        { opacity: (pressed ? 0.7 : 1) }
                    ]}
                    onPress={() => onEdit(meta.id)}>
                    <Text style={styles.actionText}>EDIT</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionBtn,
                        { opacity: (pressed ? 0.7 : 1) }
                    ]}
                    onPress={() => {
                        Alert.alert('Delete Combo?', `Delete "${title}?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => onDelete(meta.id) },
                        ]);
                    }}
                >
                    <Text style={styles.actionText}>DELETE</Text>
                </Pressable>
            </View>
        </ExpandableSection>
    );
}

const styles = StyleSheet.create({
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    loadingText: { color: colors.offWhite, opacity: 0.8 },

    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#8e8af7' },
    chipText: { color: '#0b0b2a', fontWeight: '700' },
    emptyText: { color: colors.offWhite, opacity: 0.7 },

    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center' },
    actionBtn: {
        paddingHorizontal: 14, height: 34, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
        borderColor: colors.offWhite, backgroundColor: '#384466', marginBottom: 6
    },
    actionText: { color: colors.offWhite, fontWeight: '600', letterSpacing: 0.3 },
});