import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import {useNavigation} from "@react-navigation/native";
import {Pressable, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {colors, fonts, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";

type SkillsScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Skills'>;

export default function SkillsScreen() {
    const nav = useNavigation<SkillsScreenNavProp>();

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <ScrollView>
                <Header title='SKILLS'/>

                {/*style button*/}
                <Pressable
                    style={[skillsSheet.styleSelector, {marginBottom: 30}]}
                >
                    <BodyText style={skillsSheet.styleText}>STYLE: </BodyText>
                </Pressable>

                {/*Skills Categories*/}
                <View style={[signInStyles.buttonGroup, {paddingHorizontal: 20}]}>

                    {/*Category 1*/}
                    <CategoryCard title='Cat 1' onEdit={() => {
                    }}/>

                    {/* Category 2*/}
                    <CategoryCard title='Cat 2' onEdit={() => {
                    }}/>

                    {/*Category 3*/}
                    <CategoryCard title='Cat 3' onEdit={() => {
                    }}/>

                </View>
            </ScrollView>

        </SafeAreaView>
    )
}

type CategoryCardProps = {
    title: string;
    onEdit?: () => void;
    children?: React.ReactNode;
};

function CategoryCard({ title, onEdit, children }: CategoryCardProps) {
    return (
        <View style={skillsSheet.categoryBorder}>
            <View style={skillsSheet.headerRow}>
                <BodyText style={skillsSheet.categoryTitle}>{title}</BodyText>
                <Pressable onPress={onEdit} style={skillsSheet.editButton}>
                    <BodyText style={[skillsSheet.categoryTitle, {fontSize: 16}]}>EDIT</BodyText>
                </Pressable>
            </View>

                <View style={skillsSheet.categoryBody}>
                    { children ?? <BodyText style={[skillsSheet.categoryTitle, {fontSize: 12}]}>(empty)</BodyText> }
                </View>
        </View>
    );
}

const skillsSheet = StyleSheet.create({
    styleSelector: {
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        justifyContent: 'center',
        marginHorizontal: 90
    },
    styleText: {
        color: colors.offWhite,
        fontSize: 20,
        fontFamily: 'DMSansRegular',
        textAlign: 'center',
        paddingVertical: 2
    },
    categoryBorder: {
        backgroundColor: colors.mainBtn,
        minHeight: 200,
        borderRadius: 12,
        padding: 8,
        alignSelf: 'stretch'
    },
    editButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.offWhite,
        backgroundColor: colors.form,
        marginVertical: 5
    },
    categoryTitle: {
        color: colors.offWhite,
        fontSize: 20,
        fontFamily: fonts.body
    },
    categoryBody: {
        minHeight: 120,
        flex: 1,
        borderRadius: 12,
        backgroundColor: colors.categories,
        padding: 8
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    }
});