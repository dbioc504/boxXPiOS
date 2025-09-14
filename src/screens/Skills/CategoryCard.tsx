import React from 'react';
import { View, Pressable } from "react-native";
import { BodyText } from '@/theme/T'
import { useCategory } from "@/lib/hooks/useCategory";
import { skillsStyles } from "@/screens/Skills/styles";
import {colors} from "@/theme/theme";

type Props = {
    title: string;
    onEdit?: () => void;
}

export function CategoryCard({ title, onEdit }: Props) {
    const { all: techniques, loading, error } = useCategory('user-1', title as any);

    return (
        <View style={skillsStyles.categoryCard}>
            <View style={skillsStyles.categoryHeaderRow}>
                <BodyText style={[skillsStyles.categoryTitle, { marginLeft: 7 }, ]}>{title.toUpperCase()}</BodyText>
                <Pressable onPress={onEdit} style={skillsStyles.categoryEditBtn}>
                    <BodyText style={[skillsStyles.categoryTitle, { fontSize: 16 }]}>EDIT</BodyText>
                </Pressable>
            </View>

            <View style={skillsStyles.categoryBody}>
                {loading && <BodyText style={{ opacity: 0.6 }}>(loading...)</BodyText>}
                {error && <BodyText style={{ color: 'red' }}>{error}</BodyText>}
                {!loading && !error && (
                    techniques.length > 0 ? (
                        techniques.map((t) => (
                            <BodyText key={t.id} style={{ fontSize: 14 }}>
                                {t.title}
                            </BodyText>
                        ))
                    ) : (
                        <BodyText style={{ color:colors.offWhite }}>(empty)</BodyText>
                    )
                )}
            </View>
        </View>
    );
}