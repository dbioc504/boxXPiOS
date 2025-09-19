import { StyleSheet } from "react-native";
import { colors, fonts } from '@/theme/theme'

export const skillsStyles = StyleSheet.create({
    styleSelector: {
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        justifyContent: "center",
        paddingHorizontal: 10,
        alignSelf: 'stretch',
        marginBottom: 30
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
        minHeight: 40
    },
    categoryTitle: {
        color: colors.offWhite,
        fontSize: 16.5,
        fontFamily: fonts.body,
        flex: 1
    },
    categoryHeaderActions: {
      flexDirection: 'row',
      gap: 8,
      flexShrink: 0,
      minWidth: 130,
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    categoryActionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.offWhite,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.form
    },
    categoryActionLabel: {
        fontSize: 12,
        color: colors.offWhite
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
        borderColor: colors.offWhite,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.offWhite,
    },
    radioLabel: { color: colors.offWhite, fontSize: 16 },
    saveBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 40
    },
    saveBtnText: { color: colors.offWhite, fontSize: 16 },
    // Modal styles
    modalContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    modalLoadingText: {
        opacity: 0.6,
        textAlign: 'center',
        marginTop: 20
    },
    modalErrorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    modalList: {
        flex: 1,
        marginTop: 20
    },
    modalListContent: {
        paddingBottom: 100
    },
    modalListSeparator: {
        height: 1,
        backgroundColor: colors.offWhite,
        opacity: 0.2,
        marginVertical: 8
    },
    modalListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    modalListItemIcon: {
        marginRight: 12
    },
    modalListItemText: {
        fontSize: 16,
        flex: 1,
        color: colors.offWhite
    },
    modalSavingText: {
        opacity: 0.6,
        marginTop: 16,
        textAlign: 'center'
    },
    modalBottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.offWhite,
    },
    modalAddButton: {
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    modalAddButtonIcon: {
        marginRight: 8
    },
    modalAddButtonText: {
        fontSize: 16,
        fontWeight: '600'
    },
    // View or Edit Toggle
    modeContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8
    },
    modeBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.categories,
        borderRadius: 999,
        padding: 4,
        width: 220,
        height: 36,
        overflow: 'hidden'
    },
    modeThumb: {
        position: 'absolute',
        left: 4,
        top: 4,
        bottom: 4,
        borderRadius: 999,
        backgroundColor: colors.form,
        width: 110
    },
    modeOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modeLabel: {
        fontSize: 12,
        opacity: 0.7,
        color: colors.offWhite
    },
    modeLabelActive: {
        opacity: 1,
        fontWeight: 600
    },
    // techniques in skills
    techniqueToggleArea: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8
    },
    techniqueFocusRow: {
        backgroundColor: colors.select, borderRadius: 8
    },
    techniqueRowActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    }
});