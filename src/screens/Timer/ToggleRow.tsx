import {ActivityIndicator, Pressable, StyleSheet, Switch, View} from "react-native";
import {colors} from "@/theme/theme";
import {BodyText} from "@/theme/T";
import React from "react";
import {Ionicons} from "@expo/vector-icons";

export default function ToggleRow({
                       label,
                       value,
                       onValueChange,
                       onMore,
                   }: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    onMore?: () => void;
}) {
    return (
        <View
            style={[
                S.row,
                { backgroundColor: colors.mainBtn, justifyContent: "space-between", height: 70, borderWidth: 0 },
            ]}
        >
            <BodyText style={{ color: colors.offWhite, fontWeight: "600", fontSize: 16 }}>{label}</BodyText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#667", true: colors.text }}
                    thumbColor={value ? colors.mainBtn : "#bbb"}
                />
                {onMore && (
                    <Pressable onPress={onMore} style={({ pressed }) => [S.moreBtn, pressed && { opacity: 0.7 }]}>
                        <Ionicons name="cog-outline" color={colors.offWhite} size={30} />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    row: {
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    moreBtn: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f2a44",
    },
});