import {SafeAreaView} from "react-native";
import {colors, sharedStyle} from "../theme/theme";
import {BodyText} from "../theme/T";

export default function SignInScreen() {
    return (
        <SafeAreaView style={[sharedStyle.safeArea, {backgroundColor: colors.signIn}]}>
            <BodyText style={{color: colors.offWhite}}>
                Sign In to BoxXP+
            </BodyText>
        </SafeAreaView>
    );
}