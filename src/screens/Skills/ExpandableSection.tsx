import { Style } from '@/types/common';
import {useState} from "react";
import {LayoutAnimation, Pressable, View} from "react-native";
import {skillsStyles} from "@/screens/Skills/styles";
import {BodyText} from "@/theme/T";
import {Ionicons} from "@expo/vector-icons";
import {colors} from "@/theme/theme";
import {RadioRow} from "@/screens/Skills/RadioRow";

type Props = {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    isStyleCard: boolean;
    value?: Style;
    selected?: Style | null;
    onSelect?: (v: Style) => void;
    showRadio?: boolean;
}

export function ExpandableSection({
    title,
    children,
    defaultExpanded,
    isStyleCard = false,
    value,
    selected = null,
    onSelect,
    showRadio = true,
}: Props) {
    const [expanded, setExpanded] = useState(!!defaultExpanded);
    const isSelected = isStyleCard && selected === value;

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setExpanded((e) => !e);
    };

    return (
        <View
            style={[
                skillsStyles.cardBase,
                isStyleCard ? skillsStyles.cardStyle : skillsStyles.cardNonStyle,
                isSelected && skillsStyles.cardSelected,
            ]}
        >
            <Pressable onPress={toggle} hitSlop={8} style={skillsStyles.cardHeader}>
                <BodyText style={skillsStyles.cardHeaderText}>{title}  </BodyText>
                <Ionicons name={expanded ? 'caret-up': 'caret-down'} size={20} color={colors.offWhite}/>
            </Pressable>

            {expanded && (
                <>
                    <View style={skillsStyles.cardDivider} />
                    <View style={skillsStyles.cardBody}>
                        {children}

                        {isStyleCard && value && onSelect && showRadio && (
                            <View
                                style={{
                                    marginTop: 12,
                                    alignItems: 'center',
                                    borderColor: colors.offWhite,
                                    borderWidth: 2,
                                    borderRadius: 10,
                                }}
                            >
                                <RadioRow label="SELECT" value={value} selected={selected} onSelect={onSelect}/>
                            </View>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}