import 'react-native-gesture-handler'
import RootNavigator from "./src/navigation/RootNavigator";
import React from "react";
import {useFonts} from "expo-font";
import {ThemeProvider} from "./src/theme/ThemeProvider";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function App() {
    const [fontsLoaded] = useFonts({
        FugazOne: require('./assets/fonts/FugazOne-Regular.ttf'),
        DMSansRegular: require('./assets/fonts/DMSans-Regular.ttf'),
        DMSansBold: require('./assets/fonts/DMSans-Bold.ttf'),
        DMSansBoldItalic: require('./assets/fonts/DMSans_18pt-BoldItalic.ttf'),
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