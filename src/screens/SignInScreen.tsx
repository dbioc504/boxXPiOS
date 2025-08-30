import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, View, Pressable, Text, Image } from "react-native";
import { colors, sharedStyle } from "../theme/theme";
import { BodyText } from "../theme/T";
import Logo from "../../assets/bxpLogo.svg";
import {
    AppleAuthenticationButton,
    AppleAuthenticationButtonStyle,
    AppleAuthenticationButtonType,
} from "expo-apple-authentication";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";  // make sure path matches your project

WebBrowser.maybeCompleteAuthSession();

type SignInNavProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
    const nav = useNavigation<SignInNavProp>();

    // Google OAuth request
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "274613580349-q2as3iku0sos79bmqms7j3o74jo8f4mf.apps.googleusercontent.com.apps.googleusercontent.com",
        iosClientId: "<YOUR_IOS_CLIENT_ID>.apps.googleusercontent.com"
    });

    // Handle login response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;

            // Build Firebae credential with Google ID token
            const credential = GoogleAuthProvider.credential(id_token);

            // Sign in to Firebase
            signInWithCredential(auth, credential)
                .then(userCred => {
                  console.log("User signed in with Google: ", userCred.user);
                  nav.navigate("Home");
                })
                .catch(error => {
                    console.error("Error signing in with Google: ", error);
            });
        }
    }, [response]);

    return (
        <SafeAreaView style={[sharedStyle.safeArea]}>
            {/* Logo + Header */}
            <View style={[{marginTop: 20, marginBottom: 20, flexDirection: 'row'}]}>
                <Pressable
                    onPress={() => nav.navigate('Home')}
                    style={{alignSelf: 'flex-start', position: 'absolute',
                    top: 15, left: 30}}>
                    <Image source={require('../../assets/back-button.png')} style={sharedStyle.backButton}></Image>
                </Pressable>
                <View style={signInStyles.centerWrapper}>
                    <Logo width={70} height={70} fill='#FCEAA2'></Logo>
                </View>
            </View>

            <BodyText style={signInStyles.signInText}>Sign In</BodyText>

            {/* Sign In Buttons */}
            <View style={signInStyles.buttonGroup}>

                {/* Apple Button */}
                <AppleAuthenticationButton
                    onPress={() => {
                        console.log('Pressed')
                    }}
                    buttonType={AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    style={signInStyles.appleBtn}
                    cornerRadius={25}
                />

                {/* Google Button */}
                <Pressable style={signInStyles.googleBtn} onPress={() => promptAsync()}>
                    <Image source={require('../../assets/google_logo.png')} style={signInStyles.googleLogo}/>
                    <Text style={signInStyles.googleText}>Sign in with Google</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const signInStyles = StyleSheet.create({
    signInText: {
        color: colors.text,
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 50,
        marginHorizontal: 40,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 50,
        height: 53,
        width: 300,
        alignSelf: 'center',
        marginHorizontal: 40,
        marginVertical: 20,
        fontFamily: 'RobotoMedium',
    },
    googleLogo: {
        width: 16,
        height: 16,
        marginRight: 10,
    },
    googleText: {
        fontSize: 21,
        color: 'black',
        fontWeight: 500
    },
    appleBtn: {
        width: 300,
        height: 60,
        alignSelf: 'center'
    },
    buttonGroup: {
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    centerWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})