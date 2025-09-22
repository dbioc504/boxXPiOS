import React from 'react';
import { Modal, View, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BodyText, Header } from "@/theme/T";
import { colors } from "@/theme/theme";

type Props = {
    visible: boolean;
    onClose: () => void;
    initialTitle?: string;
    onSubmit: (title: string) => Promise<void> | void;
    submitLabel?: string;
    heading: string;
    onChanged?: () => void;
}

export function TechniqueFormModal({
    visible,
    onClose,
    initialTitle = '',
    onSubmit,
    submitLabel='Add',
    heading,
}: Props){
    const [title, setTitle] = React.useState(initialTitle);
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            setTitle(initialTitle);
        }
    }, [visible, initialTitle]);

    const canSubmit = title.trim().length > 0 && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try { await onSubmit(title.trim()); setTitle(''); onClose();}
        finally { setSubmitting(false); }
    };

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType='slide' presentationStyle='formSheet'>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title={heading}/>

                <View style={styles.container}>
                    <BodyText style={styles.label}>
                        Title
                    </BodyText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder='e.g. Cut off the ring/ Shuffle and jab/ Catch and shoot'
                        placeholderTextColor='#999'
                        autoFocus
                        style={styles.input}
                        returnKeyType='done'
                        onSubmitEditing={handleSubmit}
                    />
                    <Pressable
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        style={({ pressed }) => [
                            styles.primary,
                            { opacity: canSubmit ? (pressed ? 0.8 : 1) : 0.5 },
                            { backgroundColor: pressed ? colors.pressedBorder : colors.text }
                        ]}
                    >
                        <BodyText style={styles.primaryText}>{submitLabel}</BodyText>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12
    },
    label: { opacity: 0.7 },
    input: {
        borderWidth: 1,
        borderColor: colors.offWhite,
        borderRadius: 10,
        padding: 12,
        color: colors.offWhite,
        fontSize: 16
    },
    primary: {
        marginTop: 12,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: colors.text
    },
    primaryText: { fontWeight: 600 }
})