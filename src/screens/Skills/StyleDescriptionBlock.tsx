import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { STYLE_DESCRIPT, CATEGORY_LABEL, Style } from "@/types/common";
import { STYLE_TO_CATEGORIES } from "@/types/validation";
import {skillsStyles} from "@/screens/Skills/styles";
import {BodyText} from "@/theme/T";

type Props = { styleKey: Style };

export default function StyleDescriptionBlock({ styleKey }: Props) {
    const cats = useMemo(() => STYLE_TO_CATEGORIES[styleKey] ?? [], [styleKey]);

    return (
        <View style={{ alignItems: 'center', paddingVertical: 12, gap: 8 }}>
        {/*  Description  */}
            <BodyText style={skillsStyles.expandableText}>
                {STYLE_DESCRIPT[styleKey]}
            </BodyText>

        {/*  Category List  */}
            <View style={{ alignItems: 'center', marginTop: 8 }}>
                {cats.map((cat) => (
                    <Text
                        key={cat}
                        style={[ skillsStyles.expandableText, {
                            textAlign: 'center',
                            fontSize: 14,
                            lineHeight: 20,
                            marginVertical: 2
                        }]}
                    >
                        {'\u2022'} {CATEGORY_LABEL[cat]}
                    </Text>
                ))}
            </View>
        </View>
    )
}