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
                    <View style={{flex: 1}}>
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