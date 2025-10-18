import {StyleSheet} from "react-native";

export const colors = {
    text: '#FCEAA2',
    pressedBorder: '#998E64',
    signIn: '#000000',
    background: '#120B17',
    mainBtn: '#07040A',
    categories: '#1F122C',
    form: '#5A5361',
    offWhite: '#DFDAF0',
    select: '#C26B6B',
    selected: '#943D3D',
    timerStart: '#2F742F'
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const fonts = {
    heading: 'FugazOne',
    body: 'DMSansRegular'
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

export const signInStyles = StyleSheet.create({
    signInText: {
        color: colors.text,
        fontSize: 40,
        textAlign: "center",
        marginBottom: 50,
        marginHorizontal: 40,
    },
    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 50,
        height: 53,
        width: 300,
        alignSelf: "center",
        marginHorizontal: 40,
    },
    signInBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.text,
        borderRadius: 50,
        height: 53,
        width: 300,
        alignSelf: "center",
        marginHorizontal: 40,
    },
    googleLogo: {
        width: 16,
        height: 16,
        marginRight: 10,
    },
    googleText: {
        fontSize: 21,
        color: "black",
        fontWeight: "500",
    },
    appleBtn: {
        width: 300,
        height: 60,
        alignSelf: "center",
    },
    buttonGroup: {
        paddingHorizontal: 40,
        alignItems: "center",
        rowGap: 20,
        justifyContent: "center",
    },
    centerWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emailInput: {
        borderRadius: 50,
        height: 56,
        width: 300,
        backgroundColor: colors.form,
        paddingHorizontal: 40,
        textAlign: "center",
        fontSize: 21,
        color: colors.text,
    }
});


export type Theme = typeof theme;