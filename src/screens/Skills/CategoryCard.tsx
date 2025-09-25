import React, { useMemo, useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import { BodyText } from "@/theme/T";
import { colors } from "@/theme/theme";
import type { Category } from "@/types/common";
import { skillsStyles } from "./styles";
import { SkillsModal } from "@/screens/Skills/SkillsModal";
import { useCategoryTechniques } from "@/lib/hooks/useCategoryTechniques";

type Props = {
    category: Category;
    title: string;
    onEdit?: () => void; // optional external handler
};

export function CategoryCard({ category, title, onEdit }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const { items, loading, refresh } = useCategoryTechniques(category);

    const PREVIEW_COUNT = 3;
    const preview = useMemo(() => items.slice(0, PREVIEW_COUNT), [items]);
    const more = Math.max(0, items.length - preview.length);

    const openModal = useCallback(() => {
        setModalVisible(true);
        onEdit?.();
    }, [onEdit]);

    const closeModalAndRefresh = useCallback(() => {
        setModalVisible(false);
        refresh();
    }, [refresh]);

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
                            onPress={openModal}
                            style={skillsStyles.categoryActionBtn}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel={`Edit ${title}`}
                        >
                            <BodyText style={skillsStyles.categoryActionLabel}>EDIT</BodyText>
                        </Pressable>
                    </View>
                </View>

                {/* Body */}
                <View style={skillsStyles.categoryBody}>
                    {loading ? (
                        <BodyText style={{ opacity: 0.6 }}>(loading…)</BodyText>
                    ) : items.length === 0 ? (
                        <BodyText style={{ color: colors.offWhite, opacity: 0.8 }}>
                            No techniques yet — tap EDIT to add.
                        </BodyText>
                    ) : (
                        <View style={skillsStyles.previewList}>
                            {preview.map((t) => (
                                <BodyText key={t.id} style={skillsStyles.previewItem} numberOfLines={1}>
                                    • {t.title}
                                </BodyText>
                            ))}

                            {more > 0 && (
                                <Pressable
                                    onPress={openModal}
                                    style={skillsStyles.previewMorePill}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Open ${title} list`}
                                >
                                    <BodyText style={skillsStyles.previewMoreText}>+{more} more</BodyText>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </View>

            <SkillsModal
                visible={modalVisible}
                onClose={closeModalAndRefresh}
                category={category}
                title={title}
                onChanged={refresh}
            />
        </>
    );
}
