import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import {useNavigation} from "@react-navigation/native";
import {SafeAreaView} from "react-native";
import {sharedStyle} from "@/theme/theme";
import {Header} from "@/theme/T";

type SkillsScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Skills'>;

export default function SkillsScreen() {
    const nav = useNavigation<SkillsScreenNavProp>();

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='SKILLS'/>

        </SafeAreaView>
    )
}