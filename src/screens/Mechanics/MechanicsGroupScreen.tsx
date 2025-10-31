// src/screens/Mechanics/MechanicsGroupScreen.tsx
import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, FlatList } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Header, BodyText } from '@/theme/T';
import { sharedStyle, colors } from '@/theme/theme';
import { BASE_MECHANICS_CATALOG } from '@/screens/Mechanics/mechanicsCatalog.base';
import { MOVEMENT_LABEL } from '@/types/common';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { ExpandableSection } from '@/screens/Skills/ExpandableSection';
import {getMechanicTitle, Mechanic, MechanicsGroup} from '@/types/mechanic';
import { MECHANICS_GROUP_LABEL } from '@/types/mechanic';

type Route = RouteProp<RootStackParamList, 'MechanicsGroup'>;

export default function MechanicsGroupScreen() {
    const { params } = useRoute<Route>();
    const { group } = params;

    const items = useMemo<Mechanic[]>(() => {
        return BASE_MECHANICS_CATALOG.items.filter(i => i.group === group);
    }, [group]);

    const renderItem = ({ item }: { item: Mechanic }) => {
        const title = getMechanicTitle(item, MOVEMENT_LABEL);
0
        return (
            <ExpandableSection
                key={item.id}
                id={item.id}
                title={title}
                defaultExpanded={false}
                isStyleCard={false}
                showRadio={false}
            >
                <View style={{ gap: 6 }}>
                    {item.bullets
                        .filter(b => b.text?.trim().length) // skip empty bullets
                        .map((b) => (
                            <View key={b.id} style={S.bulletRow}>
                                <BodyText style={S.dot}>{'\u2022'}</BodyText>
                                <BodyText style={S.bulletText}>{b.text}</BodyText>
                            </View>
                        ))}
                </View>
            </ExpandableSection>
        );
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title={MECHANICS_GROUP_LABEL[group as MechanicsGroup].toUpperCase() || group.toUpperCase()} />
            <View style={{ padding: 12 }}>
                {items.length ? (
                    <FlatList
                        data={items}
                        keyExtractor={(m) => m.id}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    />
                ) : (
                    <BodyText style={{ color: colors.offWhite, opacity: 0.7 }}>
                        No mechanics added yet for this group.
                    </BodyText>
                )}
            </View>
        </SafeAreaView>
    );
}

const S = StyleSheet.create({
    bulletRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    dot: { color: colors.offWhite, fontSize: 16, lineHeight: 20 },
    bulletText: { color: colors.offWhite, fontSize: 14, lineHeight: 20, flex: 1 },
});
