import {SafeAreaView, StyleSheet} from "react-native";
import {colors, sharedStyle, spacing} from "../theme/theme";
import {BodyText, Header} from "../theme/T";
import {
    AppleAuthenticationButton,
    AppleAuthenticationButtonStyle,
    AppleAuthenticationButtonType
} from "expo-apple-authentication";
import {signInBtnStyles} from "./HomeScreen";

export default function SignInScreen() {
    return (
        <SafeAreaView style={[sharedStyle.safeArea, {backgroundColor: colors.signIn}]}>
            {/*<Header title={"BOX XP+"}/>*/}
            <BodyText style={signInStyles.signInText}>Sign In</BodyText>
            <AppleAuthenticationButton
                onPress={ () => { console.log('Pressed') } }
                buttonType={AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                style={{
                    width: 300,
                    height: 60,
                    marginHorizontal: 40,
                    marginVertical: 20,
                    alignSelf: 'center'

                }}
                cornerRadius={25}
            />
        </SafeAreaView>
    );
}

const signInStyles = StyleSheet.create({
    signInText: {
        color: colors.offWhite,
        fontSize: 50,
        textAlign: 'center',
        marginTop: spacing.xl,
        marginBottom: 50,
        marginHorizontal: 40,
    }
})