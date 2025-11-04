import {useEffect, useRef, useState} from "react";
import {Alert, View, Pressable, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BodyText, Header } from "@/theme/T";
import { colors } from "@/theme/theme";
import { signInStyles, sharedStyle } from "@/theme/theme";
import { CATEGORY_LABEL, STYLE_LABEL } from "@/types/common";
import { STYLE_TO_CATEGORIES } from "@/types/validation";
import { CategoryCard } from "@/screens/Skills/CategoryCard";
import StylePickerModal from "@/screens/Skills/StylePickerModal";
import { useStyle } from "@/lib/providers/StyleProvider";
import {useAuth} from "@/lib/AuthProvider";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";

export default function SkillsScreen() {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Skills'>>();
    const { user, loading } = useAuth();
    const { ready, style } = useStyle();
    const [pickerOpen, setPickerOpen] = useState(false);
    const promptedRef = useRef(false);

    useEffect(() => {
        if (!loading && !user && !promptedRef.current) {
            promptedRef.current = true;
            Alert.alert(
                "Sign in required",
                "Create or sign in to your account to save your boxing skills and combos.",
                [
                    {
                        text: "Sign In",
                        onPress: () => nav.navigate('SignIn'),
                    }
                ],
                { cancelable: false },
            );
        }
    }, [loading, user, nav]);

    if (loading) return null;
    if (!user) return null;

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
