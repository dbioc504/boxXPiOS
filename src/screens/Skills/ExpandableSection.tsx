import { Style } from '@/types/common';
import {useState} from "react";
import { Pressable, View, StyleSheet} from "react-native";
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
            // ...inside return()

            {!headerRight ? (
                // CENTERED HEADER (no headerRight): caret pinned to right, title truly centered
                <Pressable
                    onPress={() => (expanded !== undefined ? onToggle?.(id) : setInternal(v => !v))}
                    hitSlop={8}
                    style={[skillsStyles.cardHeader, HS.centeredHeader]}
                >
                    <BodyText
                        // title will stay centered and truncate if long
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[skillsStyles.cardHeaderText, HS.centeredTitle]}
                    >
                        {title}
                    </BodyText>

                    <Ionicons
                        name={isOpen ? 'caret-up' : 'caret-down'}
                        size={20}
                        color={colors.offWhite}
                        style={HS.caret}
                    />
                </Pressable>
            ) : (
                // ROW HEADER with actions on the right
                <View style={[skillsStyles.cardHeader, HS.rowHeader]}>
                    <Pressable
                        onPress={() => (expanded !== undefined ? onToggle?.(id) : setInternal(v => !v))}
                        hitSlop={8}
                        style={HS.rowLeft}
                    >
                        <BodyText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[skillsStyles.cardHeaderText, HS.rowTitle]}
                        >
                            {title}
                        </BodyText>

                        <Ionicons
                            name={isOpen ? 'caret-up' : 'caret-down'}
                            size={20}
                            color={colors.offWhite}
                            style={{ marginLeft: 8 }}
                        />
                    </Pressable>

                    <View style={HS.rowRight}>
                        {headerRight}
                    </View>
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

const HS = StyleSheet.create({
    // centered variant
    centeredHeader: {
        position: 'relative',
        justifyContent: 'center',   // keeps the title centered
        alignItems: 'center',
        paddingRight: 28,
        paddingLeft: 18,
        minHeight: 40,
    },
    centeredTitle: {
        maxWidth: '100%',
        textAlign: 'center',
    },
    caret: {
        position: 'absolute',
        right: 8,
    },

    // row variant (with actions)
    rowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        minHeight: 40,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,   // allow this group to shrink so actions stay visible
        flexGrow: 1,
        minWidth: 0,     // enables text truncation on Android
    },
    rowTitle: {
        flexShrink: 1,
        maxWidth: '100%',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
});