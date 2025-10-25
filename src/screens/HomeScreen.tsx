import React from 'react';
import {Button, View, StyleSheet, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import {colors, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/RootNavigator";
import {useAuth} from "@/lib/AuthProvider";



type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const nav = useNavigation<HomeScreenNavProp>();

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title={"BOX XP+"}/>

            {/*App Buttons*/}
            <View style={[signInStyles.buttonGroup, {rowGap: 20}, {marginBottom: 20}]}>

                <MainButton label="SKILLS" onPress={() => nav.navigate('Skills')}/>
                <MainButton label="COMBOS" onPress={() => nav.navigate('CombosIndex')}/>
                <MainButton label="MECHANICS" onPress={() => nav.navigate('MechanicsCat')}/>
                {/*<MainButton label="DOWNLOADS" onPress={() => {}}/>*/}
                <MainButton label="TIMER" onPress={() => nav.navigate('TimerSetup')}/>

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
        height: 125,
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

    }
});

export function MainButton({ label, onPress }: { label: string; onPress?: () => void }) {
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
                <BodyText style={[
                    homeBtns.btnTxt,
                    pressed && { color: colors.form }]}>
                    {label}
                </BodyText>
            )}
        </Pressable>
    )
}

