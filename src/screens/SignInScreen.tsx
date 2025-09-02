import {SafeAreaView, View, Pressable, Text, Image, TextInput} from "react-native";
import {colors, sharedStyle, signInStyles} from "../theme/theme";
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
import {useAuth} from "../lib/AuthProvider";
import {useEffect} from "react";
import { useState } from "react";

type SignInNavProp = NativeStackNavigationProp<RootStackParamList, "SignIn">;

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

async function signInWith(provider: "google" | "apple") {
    console.log("RedirectTo being used:", redirectTo);
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
        await createSessionFromUrl(res.url);
        console.log("Auth session result:", res);
    }
}

async function createSessionFromUrl(url: string) {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    console.log("URL received:", url);
    console.log("Params parsed:", params, "Error code:", errorCode);
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
        else {
            console.log("✅ Supabase session set!");
        }
    }
}

export default function SignInScreen() {
    const nav = useNavigation<SignInNavProp>();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    async function signInWithEmail() {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo
            }
        });

        if (error) {
            console.error("Error sending magic link:", error.message);
        } else {
            console.log("Magic link sent!");
            setSent(true);
        }
    }

    useEffect(() => {
        const sub = Linking.addEventListener("url", ({ url }) => {
            console.log("Deeplink URL:", url);
            createSessionFromUrl(url);
        });

        return () => sub.remove();
    }, []);

    useEffect(() => {
        if (user) {
            nav.navigate("Home");
        }
    }, [user]);

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

            {/* Sign In Buttons */}\
            <View style={signInStyles.buttonGroup}>


                {/*Email Input*/}
                <TextInput
                    style={signInStyles.emailInput}
                    placeholder="Your email address"
                    placeholderTextColor={colors.offWhite}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <Pressable
                    style={({ pressed }) => [
                        signInStyles.signInBtn,
                        pressed && { backgroundColor: "#B1A473"}
                    ]}
                    onPress={signInWithEmail}
                >
                    <Text style={signInStyles.googleText}>Continue</Text>
                </Pressable>

                <Text style={{
                    color:colors.offWhite,
                    fontSize: 16,
                    // marginVertical:20
                }}>OR</Text>

                {/* Apple Button */}
                <AppleAuthenticationButton
                    onPress={() => signInWith("apple")}
                    buttonType={AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    style={signInStyles.appleBtn}
                    cornerRadius={25}
                />

                {/* Google Button */}
                <Pressable
                    style={({ pressed }) => [
                        signInStyles.googleBtn,
                        pressed && { backgroundColor: "#7D7D7D"}
                    ]}
                    onPress={() => signInWith("google")}>
                    <Image
                        source={require("../../assets/google_logo.png")}
                        style={signInStyles.googleLogo}
                    />
                    <Text style={signInStyles.googleText}>Sign in with Google</Text>
                </Pressable>
            </View>

            {sent && (
                <Text style={{ color: colors.offWhite, marginTop: 20, textAlign: "center" }}>
                    Check your email for the login link
                </Text>
            )}
        </SafeAreaView>
    );
}

