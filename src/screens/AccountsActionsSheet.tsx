import React from "react";
import { Modal, Pressable, View, Text, StyleSheet } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSignOut: () => void;
    onDeleteAccount: () => void;
};

export default function AccountActionsSheet({ visible, onClose, onSignOut, onDeleteAccount }: Props) {
    return(
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={S.overlay} onPress={onClose}/>

            <View style={S.sheet}>
                <Pressable style={S.item} onPress={() => {
                    onSignOut();
                    onClose();
                }}>
                    <Text style={S.itemText}>Sign Out</Text>
                </Pressable>

                <Pressable style={S.item} onPress={onDeleteAccount}>
                    <Text style={[S.itemText, { color: "#ff4d4f", fontWeight: "700" }]}>Delete Account</Text>
                </Pressable>

                <Pressable style={S.item} onPress={onClose}>
                    <Text style={[S.itemText, { color: "#999" }]}>Cancel</Text>
                </Pressable>
            </View>
        </Modal>
    )
}

const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: {
        position: "absolute",
        left: 12, right: 12, bottom: 24,
        borderRadius: 14,
        backgroundColor: "#1c1c1e",
        paddingVertical: 8
    },
    item: { paddingVertical: 14, paddingHorizontal: 16 },
    itemText: { fontSize: 17, color: "white", textAlign: "center" },
    separator: { height: 0.3, backgroundColor: "#333" },
});