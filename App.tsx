import 'react-native-gesture-handler'
import RootNavigator from "./src/navigation/RootNavigator";
import React from "react";
import {useFonts} from "expo-font";
import {ThemeProvider} from "@/theme/ThemeProvider";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {StatusBar} from 'expo-status-bar';
import {AuthProvider} from "@/lib/AuthProvider";
import {RepoProvider} from '@/lib/providers/RepoProvider'

export default function App() {

    const [fontsLoaded] = useFonts({
        FugazOne: require('./assets/fonts/FugazOne-Regular.ttf'),
        DMSansRegular: require('./assets/fonts/DMSans-Regular.ttf'),
        DMSansBold: require('./assets/fonts/DMSans-Bold.ttf'),
        DMSansBoldItalic: require('./assets/fonts/DMSans_18pt-BoldItalic.ttf'),
        Roboto: require('./assets/fonts/Roboto-Regular.ttf'),
        RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <RepoProvider>
                <ThemeProvider>
                    <StatusBar style="light"/>
                    <SafeAreaProvider>
                        <RootNavigator/>
                    </SafeAreaProvider>
                </ThemeProvider>
            </RepoProvider>
        </AuthProvider>
    );
}