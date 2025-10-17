import React, { useState } from "react";
import { Modal, View, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BodyText } from "@/theme/T";
import { colors } from "@/theme/theme";

export function DurationPicker({
    initialSec,
    onClose,
    onConfirm
}: {
    initialSec: number;
    onClose: () => void;
    onConfirm: (sec: number) => void;
}) {
    const [ms, setMs] = useState(Math.max(0, initialSec) * 1000);

    return (
        <Modal transparent animationType='fade' onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', padding: 16 }}>
                <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.offWhite }}>
                    <DateTimePicker
                        mode='countdown'
                        display='spinner'
                        value={new Date(ms)}
                        onChange={(_, d) => d && setMs(d.getTime())}
                        style={{ height: 216 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <Pressable onPress={onClose}><BodyText style={{ color: colors.offWhite }}>Cancel</BodyText></Pressable>
                        <Pressable onPress={() => onConfirm(Math.round(ms / 1000))}><BodyText style={{ color: colors.offWhite }}>Done</BodyText></Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}