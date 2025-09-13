import { StyleSheet } from "react-native";
import { colors, fonts } from '@/theme/theme'

export const skillsStyles = StyleSheet.create({
    styleSelector: {
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        justifyContent: "center",
        marginHorizontal: 90
    },
    styleSelectorText: {
        color: colors.offWhite,
        fontSize: 20,
        fontFamily: "DMSansRegular",
        textAlign: 'center',
        paddingVertical: 2
    },
    categoryCard: {
        backgroundColor: colors.mainBtn,
        minHeight: 200,
        borderRadius: 12,
        padding: 8,
        alignSelf: "stretch"
    },
    categoryHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryTitle: {
        color: colors.offWhite,
        fontSize: 20,
        fontFamily: fonts.body,
    },
    categoryEditBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.offWhite,
        backgroundColor: colors.form,
        marginVertical: 5,
    },
    categoryBody: {
        minHeight: 120,
        flex: 1,
        borderRadius: 12,
        backgroundColor: colors.categories,
        padding: 8,
    },
    cardBase: {
        marginHorizontal: 40,
        marginBottom: 12,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: colors.mainBtn,
    },
    cardNonStyle: { borderColor: colors.offWhite,  },
    cardStyle: { borderColor: colors.pressedBorder },
    cardSelected: { borderColor: colors.select },
    expandableText: {
        color: colors.offWhite,
        lineHeight: 20,
        textAlign: 'left'
    },
    cardHeader: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardHeaderText: {
        color: colors.offWhite,
        fontSize: 20,
        fontFamily: 'DMSansRegular',
    },
    cardDivider: {
        borderBottomColor: colors.offWhite,
        borderBottomWidth: 2,
        marginHorizontal: 40,
    },
    cardBody: { paddingVertical: 8, paddingHorizontal: 20 },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 40
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.select,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.select,
    },
    radioLabel: { color: colors.select, fontSize: 16 },
    saveBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 40
    },
    saveBtnText: { color: colors.offWhite, fontSize: 16 },
});