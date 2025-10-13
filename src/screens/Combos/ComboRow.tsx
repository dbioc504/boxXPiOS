import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExpandableSection } from '@/screens/Skills/ExpandableSection';
import { MOVEMENT_LABEL, type Movement } from '@/types/common';
import type { Combo } from '@/types/combo';
import { colors } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';

const nameFromSteps = (steps: Movement[]) =>
    steps.slice(0, 3).map(s => MOVEMENT_LABEL[s]).join(' - ') || 'Untitled';

export function ComboRow({
    combo,
    expanded,
    onToggle,
    onEdit,
    onDelete
}: {
    combo: Combo;
    expanded: boolean;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const title = combo.name ?? nameFromSteps(combo.steps);

    const headerRight = (
        <Pressable
            onPress={() => onToggle(combo.id)}
            hitSlop={8}
            style={styles.menuBtn}
        >
            <Ionicons name='ellipsis-horizontal' size={18} color={colors.offWhite}/>
        </Pressable>
    );

    return (
        <ExpandableSection
            id={combo.id}
            title={title}
            expanded={expanded}
            onToggle={onToggle}
            isStyleCard={false}
            showRadio={false}
            headerRight={headerRight}
        >
            {/* Chips preview */}
            <View style={styles.chipsWrap}>
                {combo.steps.map((mv, i) => (
                    <View key={`${combo.id}-${i}`} style={styles.chip}>
                        <Text style={styles.chipText}>{MOVEMENT_LABEL[mv]}</Text>
                    </View>
                ))}
            </View>

            {/*  Row  */}
            <View style={styles.actionsRow}>
                <Pressable style={[styles.actionBtn, styles.edit]} onPress={() => onEdit(combo.id)}>
                    <Text style={styles.actionText}>EDIT</Text>
                </Pressable>
                <Pressable
                    style={[styles.actionBtn, styles.delete]}
                    onPress={() => {
                        Alert.alert('Delete combo?', `Delete "${title}?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => onDelete(combo.id) },
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
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#8e8af7' },
    chipText: { color: '#0b0b2a', fontWeight: '700' },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: {
        paddingHorizontal: 14, height: 34, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', borderWidth: 2,
        borderColor: colors.offWhite,
    },
    edit: { backgroundColor: '#384466' },
    delete: { backgroundColor: '#633f3f' },
    actionText: { color: colors.offWhite, fontWeight: '800', letterSpacing: 0.3 },
    menuBtn: {
        width: 32, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.offWhite,
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2a44',
    },
});