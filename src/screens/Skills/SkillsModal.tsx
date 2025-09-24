import React from "react";
import {
    Modal,
    View,
    FlatList,
    Pressable,
    ActionSheetIOS,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, Header } from "@/theme/T";
import { colors } from "@/theme/theme";
import {Category, CATEGORY_LABEL} from "@/types/common";
import { skillsStyles } from "@/screens/Skills/styles";
import { TechniqueFormModal } from "@/screens/Skills/TechniqueFormModal";
import { useCategoryTechniques } from "@/lib/hooks/useCategoryTechniques";

type Props = {
    visible: boolean;
    onClose: () => void;
    category: Category;
    title: string;
    userId?: string;
    onChanged?: () => void;
};

export function SkillsModal({
    visible,
    onClose,
    category,
    title,
    userId = "user-1",
    onChanged
    }: Props) {
    // CRUD hook: the list and the actions you call
    const { items, loading, saving, error, add, edit, remove } =
        useCategoryTechniques(userId, category);

    // Small UI state for add/edit sheets
    const [addOpen, setAddOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<{ id: string; title: string } | null>(null);

    // EDIT row: title + pencil + trash
    const TechniqueRowEdit = ({ item }: { item: { id: string; title: string } }) => (
        <View style={skillsStyles.modalListItem}>
            <BodyText style={skillsStyles.modalListItemText}>{item.title}</BodyText>

            <View style={localStyles.rowActions}>
                {/* Edit (opens form prefilled) */}
                <Pressable
                    onPress={() => {
                        setEditing({ id: item.id, title: item.title });
                        setEditOpen(true);
                    }}
                    hitSlop={8}
                    accessibilityLabel="Edit technique"
                >
                    <Ionicons name="pencil" size={18} color={colors.offWhite} />
                </Pressable>

                {/* Delete (Confirm, then remove) */}
                <Pressable
                    onPress={() => {
                        ActionSheetIOS.showActionSheetWithOptions(
                            {
                                options: ["Cancel", "Delete"],
                                cancelButtonIndex: 0,
                                destructiveButtonIndex: 1,
                                userInterfaceStyle: "dark",
                            },
                            (i) => {
                                if (i === 1) {
                                    remove(item.id).then(() => onChanged?.());

                                }
                            }
                        );
                    }}
                    hitSlop={8}
                    accessibilityLabel="Delete technique"
                >
                    <Ionicons name="trash" size={18} color={colors.select} />
                </Pressable>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: any }) =>
        <TechniqueRowEdit item={item} />;

    // ----- Footer -----
    const renderFooter = () =>
        saving ? <BodyText style={skillsStyles.modalSavingText}>Saving...</BodyText> : null;

    return (
        <Modal animationType="slide" visible={visible} presentationStyle="pageSheet" onRequestClose={onClose}>

            {/* Add form */}
            <TechniqueFormModal
                visible={addOpen}
                onClose={() => {setAddOpen(false);}}
                submitLabel='ADD'
                heading={`ADD TO IN ${CATEGORY_LABEL[category].toUpperCase()}`}
                onSubmit={async (title) => {
                    await add(title);
                    onChanged();
                }}
            />

            {/* Edit form (prefilled) */}
            <TechniqueFormModal
                visible={editOpen}
                onClose={() => {setEditOpen(false); setEditing(null);}}
                initialTitle={editing?.title ?? ""}
                submitLabel="Save"
                heading={`EDIT IN ${CATEGORY_LABEL[category].toUpperCase()}`}
                onSubmit={async (title) => {
                    if (editing) await edit(editing.id, title);
                    onChanged?.();
                }}
            />

            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                {/* Header */}
                <Header title={title} isModal onClose={onClose} />

                {/* Body */}
                <View style={skillsStyles.modalContainer}>
                    {loading && <BodyText style={skillsStyles.modalLoadingText}>Loading...</BodyText>}
                    {error && <BodyText style={skillsStyles.modalErrorText}>{error}</BodyText>}

                    {!loading && !error && (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            style={skillsStyles.modalList}
                            contentContainerStyle={skillsStyles.modalListContent}
                            ItemSeparatorComponent={() => <View style={skillsStyles.modalListSeparator} />}
                            renderItem={renderItem}
                            ListFooterComponent={renderFooter()}
                        />
                    )}
                </View>

                {/* Sticky Add button — EDIT only */}

                <View style={skillsStyles.modalBottomContainer}>
                    <Pressable
                        onPress={() => setAddOpen(true)}
                        style={({ pressed }) => [
                            skillsStyles.modalAddButton,
                            { backgroundColor: pressed ? colors.pressedBorder : colors.text },
                        ]}
                    >
                        <Ionicons name="add" size={24} color={colors.offWhite} style={skillsStyles.modalAddButtonIcon} />
                        <BodyText style={skillsStyles.modalAddButtonText}>Add New Technique</BodyText>
                    </Pressable>
                </View>

            </SafeAreaView>
        </Modal>
    );
}

const localStyles = StyleSheet.create({
    toggleArea: { alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
    rowActions: { flexDirection: "row", alignItems: "center", gap: 12 },
});

