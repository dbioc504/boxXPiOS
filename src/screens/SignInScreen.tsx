import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Pressable,
    Text,
    Image,
    TextInput,
    Alert,
    Keyboard,
} from 'react-native';
import { colors, sharedStyle, signInStyles } from '@/theme/theme';
import { BodyText } from '@/theme/T';
import Logo from '../../assets/bxpLogo.svg';
import {
    AppleAuthenticationButton,
    AppleAuthenticationButtonStyle,
    AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { emailSchema, normalizeEmail, isValidEmail } from '@/lib/validators';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { useAuth } from '@/lib/AuthProvider';

type SignInNavProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'boxxp' });

async function createSessionFromUrl(url: string) {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) {
        console.error('Auth error code:', errorCode);
        return;
    }
    const { access_token, refresh_token } = params as Record<string, string>;
    if (access_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) console.error('❌ Error setting Supabase session', error);
        else console.log('✅ Supabase session set!');
    }
}

async function signInWith(provider: 'google' | 'apple') {
    console.log('RedirectTo being used:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
        console.error(`OAuth error with ${provider}:`, error.message);
        Alert.alert('Sign-in error', error.message);
        return;
    }
    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);
    if (res.type === 'success' && res.url) await createSessionFromUrl(res.url);
}

export default function SignInScreen() {
    const nav = useNavigation<SignInNavProp>();
    const { user } = useAuth();

    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const emailNormalized = useMemo(() => normalizeEmail(email), [email]);
    const emailOk = useMemo(() => isValidEmail(emailNormalized), [emailNormalized]);

    const handleMagicLink = useCallback(async () => {
        if (!emailOk) {
            setEmailError('Please enter a valid email address.');
            Alert.alert('Invalid email', 'Please enter a valid email address.');
            return;
        }

        setEmailError(null);
        setIsButtonPressed(true);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: emailNormalized,
                options: { emailRedirectTo: redirectTo },
            });
            if (error) {
                Alert.alert('Sign-in error', error.message);
            } else {
                setSent(true);
                Keyboard.dismiss();
            }
        } finally {
            setTimeout(() => setIsButtonPressed(false), 150);
            setLoading(false);
        }
    }, [emailOk, emailNormalized]);

    useEffect(() => {
        const sub = Linking.addEventListener('url', ({ url }) => {
            console.log('Deeplink URL:', url);
            createSessionFromUrl(url);
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        if (user) nav.navigate('Home');
    }, [user, nav]);

    return (
        <SafeAreaView style={[sharedStyle.safeArea]}>
            {/* Logo + Header */}
            <View style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row' }}>
                <Pressable
                    onPress={() => nav.navigate('Home')}
                    style={{
                        alignSelf: 'flex-start',
                        position: 'absolute',
                        top: 15,
                        left: 30,
                    }}
                >
                    {({ pressed }) => (
                        <Image
                            source={require('../../assets/back-button.png')}
                            style={[
                                sharedStyle.backButton,
                                // Optional: tint on press for feedback
                                { tintColor: pressed ? '#C9C9C9' : undefined },
                            ]}
                        />
                    )}
                </Pressable>
                <View style={signInStyles.centerWrapper}>
                    <Logo width={70} height={70} fill="#FCEAA2" />
                </View>
            </View>

            <BodyText style={signInStyles.signInText}>Sign In</BodyText>

            {/* Sign In Buttons */}
            <View style={signInStyles.buttonGroup}>
                {/* Email Input */}
                <TextInput
                    style={[
                        signInStyles.emailInput,
                        !!emailError && { borderColor: 'salmon', borderWidth: 1 },
                    ]}
                    placeholder="Your email address"
                    placeholderTextColor={colors.offWhite}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="done"
                    value={email}
                    onChangeText={(v) => {
                        setEmail(v);
                        if (emailError && emailSchema.safeParse(normalizeEmail(v)).success) {
                            setEmailError(null);
                        }
                    }}
                    onSubmitEditing={handleMagicLink}
                />

                {emailError && (
                    <Text style={{ color: 'salmon', marginTop: 6, textAlign: 'center' }}>
                        {emailError}
                    </Text>
                )}

                <Pressable
                    disabled={!emailOk || loading}
                    style={({ pressed }) => [
                        signInStyles.signInBtn,
                        (!emailOk || loading) && { opacity: 0.6 },
                        (pressed || isButtonPressed) && { backgroundColor: '#B1A473' },
                    ]}
                    onPress={handleMagicLink}
                >
                    <Text style={signInStyles.googleText}>{loading ? 'Sending…' : 'Continue'}</Text>
                </Pressable>

                <Text style={{ color: colors.offWhite, fontSize: 16 }}>OR</Text>

                {/* Apple Button */}
                <AppleAuthenticationButton
                    onPress={() => signInWith('apple')}
                    buttonType={AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    style={signInStyles.appleBtn}
                    cornerRadius={25}
                />

                {/* Google Button */}
                <Pressable
                    style={({ pressed }) => [
                        signInStyles.googleBtn,
                        pressed && { backgroundColor: '#7D7D7D' },
                    ]}
                    onPress={() => signInWith('google')}
                >
                    <Image
                        source={require('../../assets/google_logo.png')}
                        style={signInStyles.googleLogo}
                    />
                    <Text style={signInStyles.googleText}>Sign in with Google</Text>
                </Pressable>
            </View>

            {sent && (
                <Text style={{ color: colors.offWhite, marginTop: 20, textAlign: 'center' }}>
                    Check your email for the login link
                </Text>
            )}
        </SafeAreaView>
    );
}
