import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SkillsScreen from "../screens/Skills/SkillsScreen"
import ComboBuilderScreen from "@/screens/Combos/ComboBuilderScreen";
import CombosIndexScreen from "@/screens/Combos/CombosIndexScreen";
import TimerSetupScreen from "@/screens/Timer/TimerSetupScreen";

export type RootStackParamList = {
    Home: undefined;
    SignIn: undefined;
    Skills: undefined;
    ComboBuilder: { comboId: string } | undefined;
    CombosIndex: undefined;
    TimerSetup: undefined;
};

const NAV_ID = 'Rootstack' as const;

const Stack = createNativeStackNavigator<RootStackParamList, typeof NAV_ID>();

export default function RootNavigator() {
    return(
        <NavigationContainer>
            <Stack.Navigator
                id={NAV_ID}
                screenOptions={
                { headerShown: false,}}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="Skills" component={SkillsScreen} />
                <Stack.Screen name='CombosIndex' component={CombosIndexScreen} />
                <Stack.Screen name='ComboBuilder' component={ComboBuilderScreen}/>
                <Stack.Screen name='TimerSetup' component={TimerSetupScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
