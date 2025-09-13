import { Style } from '@/types/common';
import { Pressable, View } from "react-native";
import { BodyText } from "@/theme/T";
import { skillsStyles } from "@/screens/Skills/styles";

type Props = {
    label: string;
    value: Style;
    selected: Style | null;
    onSelect: (v: Style) => void;
};

export function RadioRow({ label, value, selected, onSelect }: Props) {
    const isActive = selected === value;
    return (
        <Pressable onPress={() => onSelect(value)} hitSlop={8} style={skillsStyles.radioRow}>
            <View style={skillsStyles.radioOuter}>{isActive && <View style={skillsStyles.radioInner}/>}</View>
            <BodyText style={skillsStyles.radioLabel}>{label}</BodyText>
        </Pressable>
    );
}