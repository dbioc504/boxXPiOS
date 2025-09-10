import {Pressable, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {colors, fonts, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import { useUserStyle } from '@/lib/hooks/useUserStyle'
import { useCategory } from "@/lib/hooks/useCategory";
import {STYLE_TO_CATEGORIES} from "@/types/validation";


export default function SkillsScreen() {
    const { style, setStyle } = useUserStyle('user-1');

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <ScrollView>
                <Header title='SKILLS'/>

                {/*style button*/}
                <Pressable
                    style={[skillsSheet.styleSelector, {marginBottom: 30}]}
                    onPress={() => {
                        const next = style === 'outboxer'
                            ? 'infighter'
                            : style === 'infighter'
                            ? 'boxer_puncher'
                            : 'outboxer';
                        setStyle(next);
                    }}
                >
                    <BodyText style={skillsSheet.styleText}>
                        STYLE: { style ?? '(none)' }
                    </BodyText>
                </Pressable>

                {/*Skills Categories*/}
                <View style={[signInStyles.buttonGroup, {paddingHorizontal: 20}]}>

                    {style
                        ? STYLE_TO_CATEGORIES[style].map((cat) => (
                            <CategoryCard key={cat} title={cat} onEdit={() => {}} />
                        ))
                        : <BodyText style={{ textAlign: 'center', color: colors.offWhite }}>
                            Select a style to see categories
                        </BodyText>
                    }

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

function CategoryCard({ title, onEdit }: CategoryCardProps) {
    const { all: techniques, loading, error } = useCategory('user-1', title as any);

    return (
        <View style={skillsSheet.categoryBorder}>
            <View style={skillsSheet.headerRow}>
                <BodyText style={skillsSheet.categoryTitle}>{title}</BodyText>
                <Pressable onPress={onEdit} style={skillsSheet.editButton}>
                    <BodyText style={[skillsSheet.categoryTitle, {fontSize: 16}]}>EDIT</BodyText>
                </Pressable>
            </View>

            <View style={skillsSheet.categoryBody}>
                {loading && <BodyText style={{ opacity: 0.6 }}>(loading...)</BodyText>}
                {error && <BodyText style={{ color: 'red' }}>{error}</BodyText>}
                {!loading && !error && (
                    techniques.length > 0
                        ? techniques.map((t) => (
                            <BodyText key={t.id} style={{ fontSize: 14 }}>
                                {t.title}
                            </BodyText>
                        ))
                        : <BodyText style={{ opacity: 0.6 }}>(empty)</BodyText>
                )}
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