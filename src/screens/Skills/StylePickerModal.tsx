import React, { useMemo, useState } from "react";
import {Modal, View, Pressable, ScrollView} from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { STYLE_LABEL, STYLES, Style as BoxerStyle } from "@/types/common";
import { colors } from '@/theme/theme';
import { Header, BodyText } from "@/theme/T";
import { ExpandableSection } from "@/screens/Skills/ExpandableSection";
import StyleDescriptionBlock from "@/screens/Skills/StyleDescriptionBlock";
import { skillsStyles } from "@/screens/Skills/styles";
import { useStyle } from "@/lib/providers/StyleProvider";

type Props = { visible: boolean; onClose: () => void };

export default function StylePickerModal({ visible, onClose }: Props) {
    const { style: current, save } = useStyle();
    const [selected, setSelected] = useState<BoxerStyle | null>(current ?? null);
    const [active, setActive] = useState(current ? `style:${current}` : 'memoir');

    const canSave = useMemo(
        () => selected && selected !== current,
        [selected, current]
    );

    async function onSave() {
        if (!selected) return;
        await save(selected);
        onClose();
    }

    return(
        <Modal animationType='slide' visible={visible} presentationStyle='pageSheet' onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView>
                    <Header title='STYLE' isModal onClose={onClose}/>
                    <View style={[{flex: 1}]}>
                        <ExpandableSection
                            id="memoir"
                            title="Author's Memoir"
                            isStyleCard={false}
                            expanded={active === 'memoir'}
                            onToggle={(id) => setActive(prev => (prev === id ? null : id))}
                        >
                            <View style={{ gap: 8 }}>
                                <BodyText style={skillsStyles.expandableText}>
                                    A boxer's style is not necessarily "selected" like the app suggests... Several
                                    factors
                                    determine a fighter's style: physique, abilities, personality, even your soul (if
                                    you
                                    believe in that type of thing). To be honest, you don't even truly "choose" your
                                    style
                                    yourself. It's almost as if it's determined for you at birth. A good coach should be
                                    able to tell your style, and if you don't have a coach, find one. Immediately. If
                                    you
                                    absolutely can't, ask somebody at your gym who's significantly more experienced than
                                    you.
                                </BodyText>
                                <View style={{alignItems: 'center'}}>
                                    <BodyText style={skillsStyles.expandableText}>Hone your skills.</BodyText>
                                    <BodyText style={skillsStyles.expandableText}>Master your craft.</BodyText>
                                    <BodyText style={skillsStyles.expandableText}>Embody your style.</BodyText>
                                </View>
                            </View>    
                        </ExpandableSection>

                        {STYLES.map(s => (
                            <ExpandableSection
                                key={s}
                                id={`style:${s}`}
                                title={STYLE_LABEL[s]}
                                isStyleCard
                                value={s}
                                selected={selected}
                                onSelect={setSelected}
                                expanded={active === `style:${s}`}
                                onToggle={id => setActive(prev => (prev === id ? null : id))}
                            >
                                <StyleDescriptionBlock styleKey={s}/>
                            </ExpandableSection>
                        ))}
                    </View>

                    <Pressable
                        onPress={onSave}
                        disabled={!canSave}
                        style={({pressed}) => [
                            skillsStyles.saveBtn,
                            {
                                backgroundColor: !canSave ? '#666' : pressed ? colors.selected : colors.select,
                            }
                        ]}
                    >
                        <BodyText style={skillsStyles.saveBtnText}>SAVE</BodyText>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}