import {Style, STYLES, STYLE_LABEL, STYLE_DESCRIPT, CATEGORY_LABEL} from "@/types/common";
import {useUserStyle} from "@/lib/hooks/useUserStyle";
import {useEffect, useState} from "react";
import {Alert, Animated, LayoutAnimation, Modal, Pressable, SafeAreaView, View} from "react-native";
import {colors, sharedStyle, signInStyles} from "@/theme/theme";
import {BodyText, Header} from "@/theme/T";
import ScrollView = Animated.ScrollView;
import {ExpandableSection} from "@/screens/Skills/ExpandableSection";
import {skillsStyles} from "@/screens/Skills/styles";
import {STYLE_TO_CATEGORIES} from "@/types/validation";
import {CategoryCard} from "@/screens/Skills/CategoryCard";

export default function SkillsScreen() {
    const { style: originalStyle, setStyle } = useUserStyle('user-1');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<Style | null>(originalStyle);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    useEffect(() => {
        if (modalVisible) {
            setSelectedStyle((originalStyle as Style) && null);
        }
    }, [modalVisible, originalStyle]);

    const handleSave = () => {
        if (!selectedStyle) return;

        const commit = () => {
            setStyle(selectedStyle);
            setModalVisible(false);
        };

        if (originalStyle && selectedStyle !== originalStyle) {
            Alert.alert(
                'Change style',
                'Changing your style will reset your skills for the new style.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Change', style: 'destructive', onPress: commit }
                ]
            );
        } else {
            commit();
        }
    };

    const handleToggle = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActivePanel(prev => (prev === id ? null : id));
    }

    const displayStyle = originalStyle
        ? STYLE_LABEL[originalStyle].toUpperCase()
        : '(none)';

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Modal animationType='slide' visible={modalVisible}
               presentationStyle='pageSheet' onRequestClose={() => setModalVisible(false)}>

                <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                    <Header title="STYLE" isModal onClose={() => setModalVisible(false)}/>

                    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                        <ExpandableSection id="memoir" title="Author's Memoir" isStyleCard={false}
                            expanded={activePanel === 'memoir'} onToggle={handleToggle}
                        >
                            <BodyText style={skillsStyles.expandableText}>
                                A boxer's style is not necessarily "selected" like the app suggests...
                                Several factors determine a fighter's style: physique, abilities, personality, even
                                your soul (if you believe in that type of thing). To be honest you don't even truly
                                "select" your style yourself. It's almost as if it's determined for you at birth. A good
                                coach should be able to tell your style, and if you don't have a coach, find one.
                                Immediately. If you absolutely can't, ask somebody at your boxing gym with significantly
                                more experience than you. Hone your skills. Master your craft. Embody your style.
                            </BodyText>
                        </ExpandableSection>

                        {STYLES.map((s) => (
                            <ExpandableSection
                                key={s}
                                id={`style:${s}`}
                                title={STYLE_LABEL[s]}
                                isStyleCard={true}
                                value={s}
                                selected={selectedStyle}
                                onSelect={setSelectedStyle}
                                expanded={activePanel === `style:${s}`}
                                onToggle={handleToggle}
                            >
                                <BodyText style={skillsStyles.expandableText}>{STYLE_DESCRIPT[s]}</BodyText>
                            </ExpandableSection>
                        ))}

                        <Pressable
                            onPress={handleSave}
                            disabled={!selectedStyle || selectedStyle === originalStyle}
                            style={({ pressed }) => [
                                skillsStyles.saveBtn,
                                {
                                    backgroundColor:
                                        !selectedStyle || selectedStyle === originalStyle
                                            ? '#666'
                                            : pressed
                                                ? colors.pressedBorder
                                                : colors.select ,
                                },
                            ]}
                        >
                            <BodyText style={skillsStyles.saveBtnText}>Save</BodyText>
                        </Pressable>

                    </ScrollView>
                </SafeAreaView>1
            </Modal>

            <ScrollView>
                <Header title='SKILLS'/>

                <View style={{ alignItems: 'center' }}>
                    <Pressable style={[skillsStyles.styleSelector, { alignSelf: 'center', paddingHorizontal: 12 }]}
                              onPress={() => setModalVisible(true)}>
                        <BodyText style={skillsStyles.styleSelectorText} >
                            STYLE: {displayStyle}
                        </BodyText>
                    </Pressable>
                </View>

                <View style={[signInStyles.buttonGroup, { paddingHorizontal: 20 }]}>
                    {originalStyle ? (
                        STYLE_TO_CATEGORIES[originalStyle].map(
                        (cat) => <CategoryCard key={cat} title={CATEGORY_LABEL[cat]} onEdit={() => {}}/>)
                    ) : (
                     <BodyText style={{ textAlign: 'center', color: colors.offWhite }}>
                         Select a style to see categories
                     </BodyText>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}