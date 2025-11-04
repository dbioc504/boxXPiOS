import React from 'react';
import {Alert, Button, Image, ImageSourcePropType, Pressable, StyleSheet, View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {SafeAreaView} from 'react-native-safe-area-context'
import {colors, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";
import {useAuth} from "@/lib/AuthProvider";
import SkillsIconSvg from "../../assets/skillsIcon.svg";
import MechanicsIconSvg from "../../assets/mechanicsIcon.svg";
import CombosIconSvg from "../../assets/combosIcon.svg";
import TimerIconSvg from "../../assets/timerIcon.svg";


type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const nav = useNavigation<HomeScreenNavProp>();

    const requireAuthFor = (destination: 'Skills' | 'CombosIndex') => {
        if (user) {
            nav.navigate(destination);
            return;
        }

        Alert.alert(
            "Sign in required",
            "Create or sign in to your account to save your boxing skills and combos.",
            [
                {
                    text: "Sign In",
                    onPress: () => nav.navigate('SignIn'),
                },
            ],
            { cancelable: false },
        );
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title={"BOX XP+"}/>

            {/*App Buttons*/}
            <View style={[signInStyles.buttonGroup, {rowGap: 20, marginBottom: 20, marginTop: 5}]}>

                <MainButton label="SKILLS" iconSource={SkillsIconSvg} onPress={() => requireAuthFor('Skills')}/>
                <MainButton label="COMBOS" iconSource={CombosIconSvg} onPress={() => requireAuthFor('CombosIndex')}/>
                <MainButton label="MECHANICS" iconSource={MechanicsIconSvg} onPress={() => nav.navigate('MechanicsCat')}/>
                {/*<MainButton label="DOWNLOADS" onPress={() => {}}/>*/}
                <MainButton label="TIMER" iconSource={TimerIconSvg} onPress={() => nav.navigate('TimerSetup')}/>

            </View>
            {/*login buttons*/}
            { user ?
                <View style={homeBtns.signInBtn}>
                    <Button
                        title="Sign Out"
                        color="#F0FFFF"
                        onPress={signOut}
                    />
                </View>
            :
                <View style={homeBtns.signInBtn}>
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

export const homeBtns = StyleSheet.create({
    signInBtn: {
        display: 'flex',
        borderRadius: 25,
        backgroundColor: colors.signIn,
        alignItems: 'center',
        marginHorizontal: 80
    },
    mainBtn: {
        borderRadius: 25,
        backgroundColor: colors.mainBtn,
        alignItems: 'center',
        height: 129,
        width: 310,
        borderColor: colors.text,
        borderWidth: 2,
        justifyContent: 'center',
    },
    btnTxt: {
        color: colors.offWhite,
        fontSize: 25,
        fontFamily: 'DMSansBoldItalic',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 10,

    },
    iconLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    icon: {
        width: 80,
        height: 80,
    },
});

export function MainButton({
    label,
    onPress,
    iconSource,
    disabled
}: {
    label: string;
    onPress?: () => void;
    iconSource?: React.FC<SvgProps> | ImageSourcePropType;
    disabled?: boolean;
}) {
    const isSvgComponent = iconSource && typeof iconSource === 'function';
    const SvgIcon = isSvgComponent ? iconSource as React.FC<SvgProps> : null;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                homeBtns.mainBtn,
                pressed && {
                    backgroundColor: colors.signIn,
                    transform: [{ scale: 1.02 }],
                    borderColor: colors.pressedBorder
                },
            ]}
        >
            {({ pressed }) => (
                <View style={homeBtns.iconLabelRow}>
                    { isSvgComponent && SvgIcon ? (
                        <SvgIcon width={80} height={80} />
                    ) : iconSource ? (
                        <Image source={iconSource as ImageSourcePropType} style={homeBtns.icon} resizeMode="contain" />
                    ) : null }
                    <BodyText style={[
                        homeBtns.btnTxt,
                        pressed && {color: colors.form}]}>
                        {label.toUpperCase()}
                    </BodyText>
                </View>
            )}
        </Pressable>
    )
}

