import 'react-native-gesture-handler'
import RootNavigator from "./src/navigation/RootNavigator";
import React from "react";
import {useFonts} from "expo-font";
import {ThemeProvider} from "./src/theme/ThemeProvider";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function App() {
    const [fontsLoaded] = useFonts({
        FugazOne: require('./assets/fonts/FugazOne-Regular.ttf'),
        DMSans: require('./assets/fonts/DMSans-VariableFont_opsz,wght.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return(
        <ThemeProvider>
            <SafeAreaProvider>
                <RootNavigator />
            </SafeAreaProvider>
        </ThemeProvider>
    );
}