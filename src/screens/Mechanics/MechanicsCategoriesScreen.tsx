import {SafeAreaView} from "react-native-safe-area-context";
import {sharedStyle, signInStyles} from "@/theme/theme";
import {Header} from "@/theme/T";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";
import {MECHANIC_GROUP_LABEL, MECHANIC_GROUPS, MechanicGroup} from "@/types/mechanic";
import {View} from "react-native";
import {MainButton} from "@/screens/HomeScreen";

type Nav = NativeStackNavigationProp<RootStackParamList, 'MechanicsCat'>;

export default function MechanicsCategoriesScreen(){
    const nav = useNavigation<Nav>();

    const go = (group: MechanicGroup) => {
        nav.navigate('MechanicsGroup', { group });
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title='MECHANICS'/>
            <View style={[signInStyles.buttonGroup, { marginTop: 20, rowGap: 20 }]}>
                {MECHANIC_GROUPS.map((g) => (
                    <MainButton key={g} label={MECHANIC_GROUP_LABEL[g].toUpperCase()} onPress={() => go(g)}/>
                ))}
            </View>
        </SafeAreaView>
    )
}