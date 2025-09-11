import {
    Pressable, SafeAreaView, ScrollView, StyleSheet, View, Modal,
    LayoutAnimation, Alert
} from "react-native";
import {colors, fonts, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import { useUserStyle } from '@/lib/hooks/useUserStyle'
import { useCategory } from "@/lib/hooks/useCategory";
import {STYLE_TO_CATEGORIES} from "@/types/validation";
import {useEffect, useState} from "react";

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
                        : <BodyText style={{ color:colors.offWhite }}>(empty)</BodyText>
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
    },
    textModal: {
        color: colors.offWhite,
        fontSize: 13,
        textAlign: 'auto'
    }
});


type ExpandableSectionProps = {
    title: string,
    children: React.ReactNode;
    defaultExpanded?: boolean;
};

function ExpandableSection({ title, children, defaultExpanded }: ExpandableSectionProps) {
    const [expanded, setExpanded] = useState(!!defaultExpanded);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(e => !e);
    };

    return (
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <Pressable onPress={toggle} hitSlop={8} style={{ paddingVertical: 8 }}>
                <BodyText style={ skillsSheet.styleText }>{title}</BodyText>
            </Pressable>

            {expanded && (
                <View style={{ backgroundColor: colors.categories, borderRadius: 20, padding: 12 }}>
                    {children}
                </View>
            )}
        </View>
    )
}

type StyleOption = 'outboxer' | 'boxer_puncher' | 'infighter';

function RadioRow({
                      label,
                      value,
                      selected,
                      onSelect,
                  }: {
    label: string;
    value: StyleOption;
    selected: StyleOption | null;
    onSelect: (v: StyleOption) => void;
}) {
    const isActive = selected === value;

    return (
        <Pressable
            onPress={() => onSelect(value)}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
        >
            <View
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: colors.offWhite,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                }}
            >
                {isActive && (
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: colors.offWhite,
                        }}
                    />
                )}
            </View>
            <BodyText style={{ color: colors.offWhite, fontSize: 16 }}>{label}</BodyText>
        </Pressable>
    );
}


export default function SkillsScreen() {
    const { style: originalStyle, setStyle } = useUserStyle('user-1');
    const [ modalVisible, setModalVisible ] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(originalStyle ?? null);

    useEffect(() => {
        if (modalVisible) setSelectedStyle((originalStyle as StyleOption) ?? null);
    }, [modalVisible, originalStyle]);

    const handleSave = () => {
        if (!selectedStyle) return;
        const commit = () => {
            setStyle(selectedStyle);
            setModalVisible(false)
        }

        if (originalStyle && selectedStyle !== originalStyle) {
            Alert.alert(
                'Change style?',
                'Changing your style will reset your skills for the new style.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Change', style: 'destructive', onPress: commit },
                ]
            );
        } else {
            commit();
        }
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Modal
                animationType="slide"
                visible={modalVisible}
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                    <Header title="STYLE" isModal onClose={() => setModalVisible(false)} />

                    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                        <ExpandableSection title="Author's Memoir" defaultExpanded>
                            <BodyText style={{ color: colors.offWhite, lineHeight: 20 }}>
                                A boxer's style is not necessarily selected like the app suggests...
                                Hone your skills, master your craft, embody your style.
                            </BodyText>
                        </ExpandableSection>

                        <ExpandableSection title="Choose your style">
                            <RadioRow
                                label="Outboxer"
                                value="outboxer"
                                selected={selectedStyle}
                                onSelect={setSelectedStyle}
                            />
                            <RadioRow
                                label="Boxer-Puncher"
                                value="boxer_puncher"
                                selected={selectedStyle}
                                onSelect={setSelectedStyle}
                            />
                            <RadioRow
                                label="Infighter"
                                value="infighter"
                                selected={selectedStyle}
                                onSelect={setSelectedStyle}
                            />
                        </ExpandableSection>

                        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                            <Pressable
                                onPress={handleSave}
                                disabled={!selectedStyle || selectedStyle === originalStyle}
                                style={({ pressed }) => [
                                    {
                                        borderRadius: 10,
                                        paddingVertical: 12,
                                        alignItems: 'center',
                                        backgroundColor:
                                            !selectedStyle || selectedStyle === originalStyle
                                                ? '#666'
                                                : pressed
                                                    ? colors.pressedBorder
                                                    : colors.mainBtn,
                                    },
                                ]}
                            >
                                <BodyText style={{ color: colors.offWhite, fontSize: 16 }}>Save</BodyText>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <ScrollView>
                <Header title='SKILLS'/>

                {/*style button*/}
                <Pressable
                    style={[skillsSheet.styleSelector, {marginBottom: 30}]}
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    {/*const next = style === 'outboxer'
                            ? 'infighter'
                            : style === 'infighter'
                            ? 'boxer_puncher'
                            : 'outboxer';
                        setStyle(next);*/}
                    <BodyText style={skillsSheet.styleText}>
                        STYLE: { originalStyle ?? '(none)' }
                    </BodyText>
                </Pressable>

                {/*Skills Categories*/}
                <View style={[signInStyles.buttonGroup, {paddingHorizontal: 20}]}>

                    {originalStyle
                        ? STYLE_TO_CATEGORIES[originalStyle].map((cat) => (
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

