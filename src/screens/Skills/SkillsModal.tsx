import React from "react";
import {
    Modal,
    View,
    FlatList,
    Pressable,
    ActionSheetIOS,
    StyleSheet,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, Header } from "@/theme/T";
import { colors } from "@/theme/theme";
import type { Category } from "@/types/common";
import { skillsStyles } from "@/screens/Skills/styles";
import { TechniqueFormModal } from "@/screens/Skills/TechniqueFormModal";
import { useCategoryTechniques } from "@/lib/hooks/useCategoryTechniques";

export type Mode = "view" | "edit";

type Props = {
    visible: boolean;
    onClose: () => void;
    category: Category;
    title: string;
    userId?: string;
    mode: Mode;
    onSwitchMode?: (m: Mode) => void;
};

export function SkillsModal({
    visible,
    onClose,
    category,
    title,
    userId = "user-1",
    mode,
    onSwitchMode,
}: Props) {
    // CRUD hook: the list and the actions you call
    const { items, loading, saving, error, add, edit, remove } =
        useCategoryTechniques(userId, category);

    // Small UI state for add/edit sheets
    const [addOpen, setAddOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<{ id: string; title: string } | null>(null);

    // ----- Rows -----
    // VIEW row: title only
    const TechniqueRowView = ({ item }: { item: { id: string; title: string } }) => (
        <View style={skillsStyles.modalListItem}>
            <BodyText style={skillsStyles.modalListItemText}>{item.title}</BodyText>
        </View>
    );

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
                                if (i === 1) remove(item.id);
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
        mode === "view" ? <TechniqueRowView item={item} /> : <TechniqueRowEdit item={item} />;

    // ----- Footer -----
    const renderFooter = () =>
        saving ? <BodyText style={skillsStyles.modalSavingText}>Saving...</BodyText> : null;

    return (
        <Modal animationType="slide" visible={visible} presentationStyle="pageSheet" onRequestClose={onClose}>
            {/* Add form (free-text like Reminders) */}
            <TechniqueFormModal
                visible={addOpen}
                onClose={() => setAddOpen(false)}
                submitLabel="Add"
                onSubmit={async (title) => {
                    await add(title);
                }}
            />

            {/* Edit form (prefilled) */}
            <TechniqueFormModal
                visible={editOpen}
                onClose={() => setEditOpen(false)}
                initialTitle={editing?.title ?? ""}
                submitLabel="Save"
                onSubmit={async (title) => {
                    if (editing) await edit(editing.id, title);
                }}
            />

            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                {/* Header */}
                <Header title={title} isModal onClose={onClose} />

                {/* Centered segmented toggle */}
                <View style={localStyles.toggleArea}>
                    <ModeToggle value={mode} onChange={onSwitchMode} />
                </View>

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
                            // optional: ensure re-render when mode changes
                            extraData={mode}
                        />
                    )}
                </View>

                {/* Sticky Add button — EDIT only */}
                {mode === "edit" && (
                    <View style={skillsStyles.modalBottomContainer}>
                        <Pressable
                            onPress={() => setAddOpen(true)}
                            style={({ pressed }) => [
                                skillsStyles.modalAddButton,
                                { backgroundColor: pressed ? colors.pressedBorder : colors.form },
                            ]}
                        >
                            <Ionicons name="add" size={24} color={colors.offWhite} style={skillsStyles.modalAddButtonIcon} />
                            <BodyText style={skillsStyles.modalAddButtonText}>Add New Technique</BodyText>
                        </Pressable>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

/* Segmented VIEW / EDIT toggle (self-contained styles) */
function ModeToggle({
                        value,
                        onChange,
                    }: {
    value: Mode;
    onChange?: (m: Mode) => void;
}) {
    const [w, setW] = React.useState(0);
    const thumbX = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const to = value === "view" ? 0 : w / 2;
        Animated.spring(thumbX, {
            toValue: to,
            useNativeDriver: true,
            bounciness: 10,
            speed: 16,
        }).start();
    }, [value, w]);

    return (
        <View
            style={modeStyles.bar}
            onLayout={(e) => setW(e.nativeEvent.layout.width - 8 /* padding L+R */)}
        >
            <Animated.View
                pointerEvents="none"
                style={[modeStyles.thumb, { transform: [{ translateX: thumbX }], width: "50%" }]}
            />
            <Pressable
                style={modeStyles.option}
                accessibilityRole="tab"
                accessibilityState={{ selected: value === "view" }}
                onPress={() => onChange?.("view")}
                hitSlop={8}
            >
                <BodyText style={[modeStyles.label, value === "view" && modeStyles.labelActive]}>VIEW</BodyText>
            </Pressable>
            <Pressable
                style={modeStyles.option}
                accessibilityRole="tab"
                accessibilityState={{ selected: value === "edit" }}
                onPress={() => onChange?.("edit")}
                hitSlop={8}
            >
                <BodyText style={[modeStyles.label, value === "edit" && modeStyles.labelActive]}>EDIT</BodyText>
            </Pressable>
        </View>
    );
}

const localStyles = StyleSheet.create({
    toggleArea: { alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
    rowActions: { flexDirection: "row", alignItems: "center", gap: 12 },
});

const modeStyles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.categories,
        borderRadius: 999,
        padding: 4,
        width: 220,
        height: 36,
        overflow: "hidden",
    },
    thumb: {
        position: "absolute",
        left: 4,
        top: 4,
        bottom: 4,
        borderRadius: 999,
        backgroundColor: colors.form,
    },
    option: { flex: 1, alignItems: "center", justifyContent: "center" },
    label: { fontSize: 12, opacity: 0.7, color: colors.offWhite },
    labelActive: { opacity: 1, fontWeight: "600" },
});
