import React, {useState} from 'react';
import {View, Pressable} from 'react-native';
import {BodyText} from '@/theme/T';
import {colors} from '@/theme/theme';
import {useCategory} from '@/lib/hooks/useCategory';
import type {Category} from '@/types/common';
import {skillsStyles} from './styles';
import {SkillsModal} from "@/screens/Skills/SkillsModal";
import type { Mode }from '@/screens/Skills/SkillsModal'

type Props = {
    category: Category;
    title: string;
    onEdit?: () => void;
    userId?: string;
};

export function CategoryCard(
    {
        category,
        title,
        userId = 'user-1',
    }: Props) {
    const {
        all,
        selectedIds,
        loading,
        error,
        } = useCategory(userId, category);

    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState<Mode>('view');

    return (
                <>
                    <View style={skillsStyles.categoryCard}>
                    {/* Header */}
                    <View style={skillsStyles.categoryHeaderRow}>
                        <BodyText 
                            style={skillsStyles.categoryTitle}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </BodyText>

                        {/* Edit Button */}
                        <View style={skillsStyles.categoryHeaderActions}>
                            <Pressable
                                onPress={() => {
                                    setMode('view');
                                    setModalVisible(true);
                                }}
                                style={skillsStyles.categoryActionBtn}
                                hitSlop={8}>
                                <BodyText style={skillsStyles.categoryActionLabel}>
                                    VIEW
                                </BodyText>
                            </Pressable>

                            {/*  View Button */}
                            <Pressable
                                onPress={() => {
                                    setMode('edit');
                                    setModalVisible(true);
                                }}
                                style={skillsStyles.categoryActionBtn}
                                hitSlop={8}
                            >
                                <BodyText style={skillsStyles.categoryActionLabel}>
                                    EDIT
                                </BodyText>
                            </Pressable>`
                        </View>
                        
                    </View>

                    {/* Body */}
                        <View style={skillsStyles.categoryBody}>
                            {loading && <BodyText style={{opacity: 0.6}}>(loading...)</BodyText>}
                            {error && <BodyText style={{color: 'red'}}>{error}</BodyText>}

                            {/* View mode: show selected techniques only */}
                            {!loading && !error && (
                                selectedIds.length ? (
                                    selectedIds
                                        .map(id => all.find(t => t.id === id))
                                        .filter(Boolean)
                                        .map(t => (
                                            <BodyText key={t!.id} style={{fontSize: 14}}>
                                                {t!.title}
                                            </BodyText>
                                        ))
                                ) : (
                                    <BodyText style={{color: colors.offWhite}}>(empty)</BodyText>
                                )
                            )}
                        </View>
                    </View>

                    <SkillsModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        category={category}
                        title={title}
                        userId={userId}
                        mode={mode}
                        onSwitchMode={setMode}
                    />
                </>
    );
}
