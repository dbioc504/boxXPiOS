import React from 'react';
import { Modal, SafeAreaView, View, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {BodyText, Header} from "@/theme/T";
import { colors } from "@/theme/theme";
import { useCategory } from "@/lib/hooks/useCategory";
import type { Category } from "@/types/common";
import { skillsStyles } from "@/screens/Skills/styles";

type Props = {
    visible: boolean;
    onClose: () => void;
    category: Category;
    title: string;
    userId?: string;
};

export function CategoryEditModal({
    visible,
    onClose,
    category,
    title,
    userId='user-1'
}: Props) {

    const {
        all, selectedIds, loading, saving, error, toggleSelection
    } = useCategory(userId, category);

    const handleAddNew = () => {
        console.log('Add new technique');
    };

    const renderTechniqueItem = ({ item }: { item: any }) => {
        const checked = selectedIds.includes(item.id);
        return (
            <Pressable onPress={() => toggleSelection(item.id)} style={skillsStyles.modalListItem}>
                <Ionicons
                    name={ checked ? 'checkmark-circle' : 'ellipse-outline' }
                    size={24}
                    color={ checked? colors.select : colors.offWhite }
                    style={skillsStyles.modalListItemIcon}
                />
                <BodyText style={skillsStyles.modalListItemText}>{item.title}</BodyText>
            </Pressable>
        );
    }

    const renderSeparator = () => <View style={skillsStyles.modalListSeparator}/>;

    const renderFooter = () => {
        if (!saving) return null;
        return <BodyText style={skillsStyles.modalSavingText}>Saving...</BodyText>
    };

    return (
        <Modal
            animationType='slide'
            visible={visible}
            presentationStyle='pageSheet'
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title={title} isModal onClose={onClose}/>

                <View style={skillsStyles.modalContainer}>
                    {loading && <BodyText style={skillsStyles.modalLoadingText}>Loading...</BodyText>}
                    {error && <BodyText style={skillsStyles.modalErrorText}>{error}</BodyText>}

                    {!loading && !error && (
                        <FlatList
                            data={all}
                            keyExtractor={item => item.id}
                            style={skillsStyles.modalList}
                            contentContainerStyle={skillsStyles.modalListContent}
                            ItemSeparatorComponent={renderSeparator}
                            renderItem={renderTechniqueItem}
                            ListFooterComponent={renderFooter()}
                        />
                    )}
                </View>

                <View style={skillsStyles.modalBottomContainer}>
                    <Pressable
                        onPress={handleAddNew}
                        style={({ pressed }) => [
                            skillsStyles.modalAddButton,
                            {
                                backgroundColor : pressed ? colors.pressedBorder : colors.form
                            }
                        ]}
                    >

                        <Ionicons
                            name='add'
                            size={24}
                            color={colors.offWhite}
                            style={skillsStyles.modalAddButtonIcon}
                        />

                        <BodyText style={skillsStyles.modalAddButtonText}>Add New Technique</BodyText>

                    </Pressable>
                </View>

            </SafeAreaView>
        </Modal>
    )

}