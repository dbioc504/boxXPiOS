import {StyleSheet} from "react-native";

export const colors = {
    text: '#FCEAA2',
    signIn: '#000000',
    background: '#120B17',
    offWhite: '#DFDAF0',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const fonts = {
    heading: 'FugazOne',
}

export const theme = {
    colors,
    fonts
}

export const sharedStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        flexDirection:"column"
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md
    },
    headerCenter: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 60,
        borderColor: colors.offWhite,
    },
    backButton: {
        width: 30,
        height: 30,
        tintColor: colors.text,
    }
});


export type Theme = typeof theme;