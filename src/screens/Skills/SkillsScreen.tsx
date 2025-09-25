import { useState } from "react";
import {View, Pressable, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BodyText, Header } from "@/theme/T";
import { colors } from "@/theme/theme";
import { signInStyles, sharedStyle } from "@/theme/theme";
import { CATEGORY_LABEL, STYLE_LABEL } from "@/types/common";
import { STYLE_TO_CATEGORIES } from "@/types/validation";
import { CategoryCard } from "@/screens/Skills/CategoryCard";
import StylePickerModal from "@/screens/Skills/StylePickerModal";
import { useStyle } from "@/lib/providers/StyleProvider";

export default function SkillsScreen() {
    const { ready, style } = useStyle();
    const [pickerOpen, setPickerOpen] = useState(false);

    if (!ready) return null;

    const display = style ? STYLE_LABEL[style].toUpperCase() : '(none)';

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <StylePickerModal visible={pickerOpen} onClose={() => setPickerOpen(false)}/>
            <ScrollView>
                <Header title='SKILLS'/>
                <View style={[{alignItems: 'center', marginBottom: 30}]}>
                    <Pressable
                        onPress={() => setPickerOpen(true)}
                        style={({pressed}) => [
                            {
                                alignSelf: 'center',
                                paddingHorizontal: 10,
                                borderWidth: 0.5,
                                borderRadius: 5,
                                paddingVertical: 8,
                                borderColor: pressed ? colors.form : colors.offWhite
                            }
                        ]}
                    >
                        {({pressed}) => (
                            <BodyText style={[{color: pressed ? colors.form : colors.offWhite, fontSize: 20}]}>
                                STYLE: {display}
                            </BodyText>
                        )}
                    </Pressable>
                </View>

                <View style={[signInStyles.buttonGroup, {paddingHorizontal: 20}]}>
                    {style ? (
                        STYLE_TO_CATEGORIES[style].map(cat => (
                            <CategoryCard key={cat} category={cat} title={CATEGORY_LABEL[cat].toUpperCase()}/>
                        ))
                    ) : (
                        <BodyText style={{textAlign: 'center', color: colors.offWhite}}>
                            Select a style to see categories
                        </BodyText>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}