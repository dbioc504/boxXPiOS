import { Style } from '@/types/common';
import {useState} from "react";
import { Pressable, View} from "react-native";
import {skillsStyles} from "@/screens/Skills/styles";
import {BodyText} from "@/theme/T";
import {Ionicons} from "@expo/vector-icons";
import {colors} from "@/theme/theme";
import {RadioRow} from "@/screens/Skills/RadioRow";

type Props = {
    id: string;
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onToggle?: (id: string) => void;
    isStyleCard: boolean;
    value?: Style;
    selected?: Style | null;
    onSelect?: (v: Style) => void;
    showRadio?: boolean;
    headerRight?: React.ReactNode;
}

export function ExpandableSection({
    id,
    title,
    children,
    defaultExpanded,
    expanded,
    onToggle,
    isStyleCard = false,
    value,
    selected = null,
    onSelect,
    showRadio = true,
    headerRight
}: Props) {
    const [internal, setInternal] = useState(!!defaultExpanded);
    const isControlled = expanded !== undefined;
    const isOpen = isControlled ? !!expanded : internal;

    const isSelected = isStyleCard && selected === value;

    return (
        <View
            style={[
                skillsStyles.cardBase,
                isStyleCard ? skillsStyles.cardStyle : skillsStyles.cardNonStyle,
                isSelected && skillsStyles.cardSelected,
            ]}
        >
            {!headerRight ? (
                // ORIGINAL centered header (unchanged)
                <Pressable
                    onPress={() => (expanded !== undefined ? onToggle?.(id) : setInternal(v => !v))}
                    hitSlop={8}
                    style={skillsStyles.cardHeader}
                >
                    <BodyText style={skillsStyles.cardHeaderText}>{title} </BodyText>
                    <Ionicons name={isOpen ? 'caret-up' : 'caret-down'} size={20} color={colors.offWhite}/>
                </Pressable>
            ) : (
                // Row header when actions exist: title left, actions right
                <View style={[skillsStyles.cardHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Pressable
                        onPress={() => (expanded !== undefined ? onToggle?.(id) : setInternal(v => !v))}
                        hitSlop={8}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <BodyText style={skillsStyles.cardHeaderText}>{title} </BodyText>
                        <Ionicons name={isOpen ? 'caret-up' : 'caret-down'} size={20} color={colors.offWhite}/>
                    </Pressable>

                    <View>{headerRight}</View>
                </View>
            )}

            {isOpen && (
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