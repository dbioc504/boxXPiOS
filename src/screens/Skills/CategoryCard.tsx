// src/screens/Skills/CategoryCard.tsx
import React, { useState } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodyText } from '@/theme/T';
import { colors } from '@/theme/theme';
import { useCategory } from '@/lib/hooks/useCategory';
import type { Category } from '@/types/common';
import { skillsStyles } from './styles';

type Props = {
    category: Category;
    title: string;
    userId?: string; // defaults to mock user
};

export function CategoryCard({ category, title, userId = 'user-1' }: Props) {
    const {
        all,
        selectedIds,
        loading,
        saving,
        error,
        toggleSelection,
    } = useCategory(userId, category);

    const [editing, setEditing] = useState(false);

    return (
        <View style={skillsStyles.categoryCard}>
            {/* Header */}
            <View style={skillsStyles.categoryHeaderRow}>
                <BodyText style={skillsStyles.categoryTitle}>{title}</BodyText>

                <Pressable
                    onPress={() => setEditing((e) => !e)}
                    style={skillsStyles.categoryEditBtn}
                >
                    <BodyText style={[skillsStyles.categoryTitle, { fontSize: 16 }]}>
                        {editing ? 'DONE' : 'EDIT'}
                    </BodyText>
                </Pressable>
            </View>

            {/* Body */}
            <View style={skillsStyles.categoryBody}>
                {loading && <BodyText style={{ opacity: 0.6 }}>(loading...)</BodyText>}
                {error && <BodyText style={{ color: 'red' }}>{error}</BodyText>}

                {/* View mode: show selected techniques only */}
                {!loading && !error && !editing && (
                    <>
                        {selectedIds.length ? (
                            selectedIds
                                .map((id) => all.find((t) => t.id === id))
                                .filter(Boolean)
                                .map((t) => (
                                    <BodyText key={t!.id} style={{ fontSize: 14 }}>
                                        {t!.title}
                                    </BodyText>
                                ))
                        ) : (
                            <BodyText style={{ color: colors.offWhite }}>(empty)</BodyText>
                        )}
                    </>
                )}

                {/* Edit mode: show full catalog with check icons */}
                {!loading && !error && editing && (
                    <FlatList
                        data={all}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        renderItem={({ item }) => {
                            const checked = selectedIds.includes(item.id);
                            return (
                                <Pressable
                                    onPress={() => toggleSelection(item.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                    }}
                                >
                                    <Ionicons
                                        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={22}
                                        color={checked ? colors.select : colors.offWhite}
                                        style={{ marginRight: 10 }}
                                    />
                                    <BodyText style={{ fontSize: 14 }}>{item.title}</BodyText>
                                </Pressable>
                            );
                        }}
                        ListFooterComponent={
                            saving ? (
                                <BodyText style={{ opacity: 0.6, marginTop: 8 }}>Saving…</BodyText>
                            ) : null
                        }
                    />
                )}
            </View>
        </View>
    );
}
