// src/screens/Timer/RadioRowGeneric.tsx
import React from "react";
import { Pressable, View } from "react-native";
import { BodyText } from "@/theme/T";
import { colors } from "@/theme/theme";

type Props<T extends string> = {
    label: string;
    value: T;
    selected: T | null;
    onSelect: (v: T) => void;
};

export function RadioRowGeneric<T extends string>({ label, value, selected, onSelect }: Props<T>) {
    const isOn = selected === value;
    return (
        <Pressable
            onPress={() => onSelect(value)}
            style={({ pressed }) => [
                {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.offWhite,
                    backgroundColor: pressed ? "#1f2a44" : "transparent",
                },
            ]}
        >
            <View
                style={{
                    width: 18,
                    height: 18,
                    marginRight: 10,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: colors.offWhite,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isOn && (
                    <View
                        style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: colors.offWhite }}
                    />
                )}
            </View>
            <BodyText style={{ color: colors.offWhite, fontWeight: "700" }}>{label}</BodyText>
        </Pressable>
    );
}
