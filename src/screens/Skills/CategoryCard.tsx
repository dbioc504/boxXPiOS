import React, {useState} from 'react';
import {View, Pressable} from 'react-native';
import {BodyText} from '@/theme/T';
import {colors} from '@/theme/theme';
import type {Category} from '@/types/common';
import {skillsStyles} from './styles';
import {SkillsModal} from "@/screens/Skills/SkillsModal";
import {useCategoryTechniques} from "@/lib/hooks/useCategoryTechniques";

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

    const [modalVisible, setModalVisible] = useState(false);
    const { items, loading, error, refresh } = useCategoryTechniques(userId, category);
    const PREVIEW_COUNT = 3;
    const preview = React.useMemo(() => {
        return items.slice(0, PREVIEW_COUNT);
    }, [items]);

    const more = Math.max(0, items.length - preview.length);

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
                            {/*  View Button */}
                            <Pressable
                                onPress={() => {
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

                            {!loading && !error && (
                                items.length === 0 ? (
                                    <BodyText style={{ color: colors.offWhite, opacity: 0.8 }}>
                                        No techniques yet - tap EDIT to add.
                                    </BodyText>
                                ) : (
                                    <View style={skillsStyles.previewList}>
                                        {preview.map(t => (
                                            <BodyText
                                                key={t.id}
                                                style={skillsStyles.previewItem}
                                            >
                                                • {t.title}
                                            </BodyText>
                                        ))}

                                        {more > 0 && (
                                            <View style={skillsStyles.previewMorePill}>
                                                <BodyText style={skillsStyles.previewMoreText}>+{more} more</BodyText>
                                            </View>
                                        )}
                                    </View>
                                )
                            )}
                        </View>
                    </View>

                    <SkillsModal
                        visible={modalVisible}
                        onClose={() => {setModalVisible(false); refresh();}}
                        category={category}
                        title={title}
                        userId={userId}
                        onChanged={refresh}
                    />
                </>
    );
}
