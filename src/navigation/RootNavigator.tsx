import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SkillsScreen from "../screens/Skills/SkillsScreen"

export type RootStackParamList = {
    Home: undefined,
    SignIn: undefined,
    Skills: undefined
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
