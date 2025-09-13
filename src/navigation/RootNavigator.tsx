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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    // @ts-ignore
    return(
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={
                { headerShown: false, animation: "fade", animationDuration: 160 }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="Skills" component={SkillsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
