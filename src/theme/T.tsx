import React from 'react';
import { Image, Pressable, Text, View, StyleSheet } from "react-native";
import {colors, sharedStyle} from "./theme";
import {useNavigation, useRoute} from "@react-navigation/native";
import Logo from '../../assets/bxpLogo.svg'
import {Ionicons} from "@expo/vector-icons";

type Props = React.ComponentProps<typeof Text>;

type HeaderProps = {
    title: string;
    forceMode?: 'home' | 'back';
    isModal?: boolean;
    onClose?: () => void;
    canGoBack?: boolean;
    onBack?: () => void;
    rightSlot?: React.ReactNode;
};

export function T(props: Props) {
    return (<Text {...props} style={[{ fontFamily: 'FugazOne' }, props.style]} />);
}

export function BodyText(props: Props) {
    return (<Text {...props} style={[{ fontFamily: 'DMSans' }, props.style]} />);
}

const SIDE_WIDTH = 56;


export function Header({ title, forceMode, onClose, isModal, rightSlot }: HeaderProps) {
    const nav = useNavigation<any>();
    const route = useRoute();

    const isHome = forceMode ? forceMode === 'home' : route.name === 'Home';
    const canGoBack = typeof nav.canGoBack === 'function' ? nav.canGoBack() : false;

    const handleBack = () => {
        if (canGoBack) nav.goBack();
        else nav.navigate('Home');
    };

    const handleClose = () => {
        if (onClose) onClose();
        else if (canGoBack) nav.goBack();
    }

    return (
        <View style={[styles.container]}>
            {/* LEFT SIDE: back button only on non-Home */}
            <View style={[styles.side, { width: SIDE_WIDTH, alignItems: 'flex-start' }]}>
                {   isModal ? (
                    <Pressable
                        onPress={handleClose}
                        hitSlop={12}
                        accessibilityRole='button'
                        accessibilityLabel='Close modal'
                    >
                        {({ pressed }) => (
                            <Ionicons
                                name='close-circle-outline'
                                size={26}
                                color={ pressed ? colors.pressedBorder : colors.text }
                            />
                        )}
                    </Pressable>
                    ) : (
                    !isHome && (
                    <Pressable
                        onPress={handleBack}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        {({ pressed }) => (
                            <Image
                                source={require('../../assets/back-button.png')}
                                style={[
                                    sharedStyle.backButton,
                                    { tintColor: pressed ? colors.pressedBorder : colors.text }
                                ]}
                            />
                        )}
                    </Pressable>
                ))}
            </View>

            {/* CENTER: Home => Logo + Title (in a row). Non-Home => Title centered. */}
            <View style={styles.centerRow}>
                {isHome && (
                    <View style={styles.homeRow}>
                        <Logo width={70} height={70} fill="#FCEAA2" />
                        <T
                            style={[sharedStyle.headerTitle, styles.titleWithLogo]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.6}
                        >
                            {title}
                        </T>
                    </View>
                )}

                {!isHome && (
                    <T
                        style={[sharedStyle.headerTitle, { marginLeft: 30 }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                    >
                        {title}
                    </T>
                )}
            </View>

            {/* RIGHT SIDE: invisible spacer to keep center truly centered */}
            <View style={[styles.side, { width: SIDE_WIDTH, paddingRight: 20, alignItems: 'flex-start' }]} >
                { rightSlot ?? null }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // your existing row container base (paddingHorizontal, height, bg, etc.)
        // you can also merge sharedStyle.headerRow here if you want
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    side: {
        paddingLeft: 20,
        justifyContent: 'center',
        // leave width set dynamically to SIDE_WIDTH above
    },
    centerRow: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // this ensures the center stays centered regardless of left contents
    },
    homeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleWithLogo: {
        marginLeft: 8, // space between logo and title on Home
    },
});