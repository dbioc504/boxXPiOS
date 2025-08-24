import 'react-native-gesture-handler'
import RootNavigator from "./src/navigation/RootNavigator";
import React from "react";
import {useFonts} from "expo-font";
import {ThemeProvider} from "./src/theme/ThemeProvider";

export default function App() {
    const [fontsLoaded] = useFonts({
        FugazOne: require('./assets/fonts/FugazOne-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return(
        <ThemeProvider>
            <RootNavigator />
        </ThemeProvider>
    );
}