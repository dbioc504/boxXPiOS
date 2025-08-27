import React from 'react';
import {Button, View, StyleSheet} from 'react-native';
import {colors, sharedStyle} from "../theme/theme";
import {Header} from "../theme/T";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/RootNavigator";

type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const nav = useNavigation<HomeScreenNavProp>();

    return (
        <View style={sharedStyle.safeArea}>
            <Header title={"BOX XP+"}/>
            <View style={signInBtnStyles.container}>
                <Button
                    title="Sign In/ Create Account"
                    onPress={() => nav.navigate('SignIn')}
                    color="#F0FFFF"
                />
            </View>
        </View>
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

