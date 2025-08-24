import {StyleSheet} from "react-native";

export const colors = {
    text: '#FFFF00',
    background: '#00008B'
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
    headerLeft: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerRight: {
        width: 40
    },
    headerTitle: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 60
    }
});

export type Theme = typeof theme;