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

import { supabase } from "../lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";

type SignInNavProp = NativeStackNavigationProp<RootStackParamList, "SignIn">;

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri(); // should resolve to boxxp://redirect

async function createSessionFromUrl(url: string) {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) {
        console.error("Auth error code:", errorCode);
        return;
    }

    const { access_token, refresh_token } = params as Record<string, string>;
    if (access_token) {
        const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });
        if (error) console.error("❌ Error setting Supabase session", error);
        else console.log("✅ Supabase session set!");
    }
}

async function signInWith(provider: "google" | "apple") {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) {
        console.error(`OAuth error with ${provider}:`, error.message);
        return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo);
    if (res.type === "success" && res.url) {
        console.log("Deep link received:", res.url);
        await createSessionFromUrl(res.url);
    }
}
    console.log("RedirectTo I'm passing:", redirectTo);


// Catch links if app is already open
    Linking.addEventListener("url", ({ url }) => {
        console.log("Deep link event:", url);
        createSessionFromUrl(url);
});

export default function SignInScreen() {
    const nav = useNavigation<SignInNavProp>();

    return (
        <SafeAreaView style={[sharedStyle.safeArea]}>
            {/* Logo + Header */}
            <View style={{ marginTop: 20, marginBottom: 20, flexDirection: "row" }}>
                <Pressable
                    onPress={() => nav.navigate("Home")}
                    style={{
                        alignSelf: "flex-start",
                        position: "absolute",
                        top: 15,
                        left: 30,
                    }}
                >
                    <Image
                        source={require("../../assets/back-button.png")}
                        style={sharedStyle.backButton}
                    />
                </Pressable>
                <View style={signInStyles.centerWrapper}>
                    <Logo width={70} height={70} fill="#FCEAA2" />
                </View>
            </View>

            <BodyText style={signInStyles.signInText}>Sign In</BodyText>

            {/* Sign In Buttons */}
            <View style={signInStyles.buttonGroup}>
                {/* Apple Button */}
                <AppleAuthenticationButton
                    onPress={() => signInWith("apple")}
                    buttonType={AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    style={signInStyles.appleBtn}
                    cornerRadius={25}
                />

                {/* Google Button */}
                <Pressable style={signInStyles.googleBtn} onPress={() => signInWith("google")}>
                    <Image
                        source={require("../../assets/google_logo.png")}
                        style={signInStyles.googleLogo}
                    />
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
        textAlign: "center",
        marginBottom: 50,
        marginHorizontal: 40,
    },
    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 50,
        height: 53,
        width: 300,
        alignSelf: "center",
        marginHorizontal: 40,
        marginVertical: 20,
    },
    googleLogo: {
        width: 16,
        height: 16,
        marginRight: 10,
    },
    googleText: {
        fontSize: 21,
        color: "black",
        fontWeight: "500",
    },
    appleBtn: {
        width: 300,
        height: 60,
        alignSelf: "center",
    },
    buttonGroup: {
        paddingHorizontal: 40,
        alignItems: "center",
    },
    centerWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
