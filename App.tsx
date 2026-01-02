import 'react-native-gesture-handler'
import RootNavigator from "./src/navigation/RootNavigator";
import React, {useEffect} from "react";
import {useFonts} from "expo-font";
import {ThemeProvider} from "@/theme/ThemeProvider";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {StatusBar} from 'expo-status-bar';
import {AuthProvider} from "@/lib/AuthProvider";
import {RepoProvider} from '@/lib/providers/RepoProvider'
import {StyleProvider} from "@/lib/providers/StyleProvider";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {CombosRepoProvider} from '@/lib/repos/CombosRepoContext';
import { LogBox } from "react-native";
import { audioSession } from "@/audioSession";

LogBox.ignoreLogs([
    'Text strings must be rendered within a <Text> component',
]);


export default function App() {

    useEffect(() => {
        audioSession.init();
    }, []);

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <RepoProvider>
                    <StyleProvider>
                        <ThemeProvider>
                            <CombosRepoProvider>
                                <StatusBar style="light"/>
                                <SafeAreaProvider>
                                    <RootNavigator/>
                                </SafeAreaProvider>
                            </CombosRepoProvider>
                        </ThemeProvider>
                    </StyleProvider>
                </RepoProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
