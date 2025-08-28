import {SafeAreaView, StyleSheet, View, Pressable, Text, Image} from "react-native";
import {colors, sharedStyle, spacing} from "../theme/theme";
import {BodyText} from "../theme/T";
import Logo from '../../assets/bxpLogo.svg'
import {
    AppleAuthenticationButton,
    AppleAuthenticationButtonStyle,
    AppleAuthenticationButtonType
} from "expo-apple-authentication";

export default function SignInScreen() {
    return (
        <SafeAreaView style={[sharedStyle.safeArea]}>
            <View style={[{margin: spacing.lg}, {alignSelf: 'center'}]} >
                <Logo width={100} height={100} fill='#FCEAA2'></Logo>
            </View>
            <BodyText style={signInStyles.signInText}>Sign In</BodyText>

            <View style={signInStyles.buttonGroup}>
                <AppleAuthenticationButton
                onPress={() => {
                    console.log('Pressed')
                }}
                buttonType={AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                style={signInStyles.appleBtn}
                cornerRadius={25}
            />
                <Pressable style={signInStyles.googleBtn} onPress={() => {
                }}>
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
        height: 55,
        width: 300,
        alignSelf: 'center',
        marginHorizontal: 40,
        marginVertical: 20,
        fontFamily: 'RobotoMedium',
    },
    googleLogo: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    googleText: {
        fontSize: 20,
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
    }
})