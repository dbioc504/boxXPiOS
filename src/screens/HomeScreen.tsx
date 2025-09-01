import React from 'react';
import {Button, View, StyleSheet, SafeAreaView} from 'react-native';
import {colors, sharedStyle} from "../theme/theme";
import {Header} from "../theme/T";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/RootNavigator";
import {useAuth} from "../lib/AuthProvider";



type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const nav = useNavigation<HomeScreenNavProp>();

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title={"BOX XP+"}/>
            { user ?
            //     sign out
                <View style={signInBtnStyles.container}>
                    <Button
                        title="Sign Out"
                        color="#F0FFFF"
                        onPress={signOut}
                    />
                </View>
            :
                <View style={signInBtnStyles.container}>
                    <Button
                        title="Sign In/ Create Account"
                        onPress={() => nav.navigate('SignIn')}
                        color="#F0FFFF"
                    />
                </View>
            }


        </SafeAreaView>
    );
}

export const signInBtnStyles = StyleSheet.create({
    container: {
        display: 'flex',
        borderRadius: 25,
        backgroundColor: colors.signIn,
        alignItems: 'center',
        marginHorizontal: 40
    }
});

