import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Switch, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Header, BodyText } from "@/theme/T";
import { colors, sharedStyle } from "@/theme/theme";
import { fmtMMSS } from "@/lib/time";
// @ts-ignore
import { DurationPicker } from "@/screens/Timer/DurationPicker";
import { TimerConfig, DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY } from "@/types/timer";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Nav = NativeStackScreenProps<RootStackParamList, "TimerSetup">["navigation"];

type OpenPickerTarget = null | "round" | "rest" | "warmup";

export default function TimerSetupScreen() {
    const nav = useNavigation<Nav>();
    const [cfg, setCfg] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
    const [open, setOpen] = useState<OpenPickerTarget>(null);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(TIMER_STORE_KEY);
                if (raw) setCfg({ ...DEFAULT_TIMER_CONFIG, ...JSON.parse(raw) });
            } catch {}
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(cfg)).catch(() => {});
    }, [cfg]);

    const canStart = useMemo(() => cfg.rounds >= 1 && cfg.roundSec >= 30, [cfg]);

    const openPicker = (t: OpenPickerTarget) => setOpen(t);
    const closePicker = () => setOpen(null);
    const setPicked = (sec: number) => {
        if (open === 'round') setCfg(c => ({ ...c, roundSec: sec }));
        if (open === 'rest') setCfg(c => ({ ...c, restSec: sec }));
        if (open === 'warmup') setCfg(c => ({ ...c, warmupSec: sec }));
        closePicker();
    };

    const bumpRounds = (delta: number) =>
        setCfg(c => ({ ...c, rounds: Math.max(1, Math.min(99, c.rounds + delta)) }));

    const goSkillDisplay = () => nav.navigate("SkillDisplay");
    const goComboDisplay = () => nav.navigate("ComboDisplay");
    const goMechanicsDisplay = () => nav.navigate("MechanicsDisplay");

    const onStart = () => {
        if (!canStart) {
            Alert.alert("Timer", "Please set at least 1 round and >= 0:30 round time.");
            return;
        }
        nav.navigate("TimerRun", { fromSetup: true });
    };

    const onSave = () => {
        AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(cfg))
            .then(() => Alert.alert("Saved", "Timer settings saved."))
            .catch(() => Alert.alert("Oops", "Could not save right now"));
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="TIMER"/>

            <View style={{ paddingHorizontal: 12, gap: 12 }}>
                {/*  ROUNDS  */}
                <Row>
                    <RowLabel>ROUNDS</RowLabel>
                    <Counter
                        value={cfg.rounds}
                        onDec={() => bumpRounds(-1)}
                        onInc={() => bumpRounds(1)}
                    />
                </Row>

                {/*  ROUND TIME  */}
                <Row onPress={() => openPicker("round")}>
                    <RowLabel>ROUND TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.roundSec)}</Pill>
                </Row>

                {/* REST TIME */}
                <Row onPress={() => openPicker("rest")}>
                    <RowLabel>REST TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.restSec)}</Pill>
                </Row>

                {/*  GET READY  */}
                <Row onPress={() => openPicker("warmup")}>
                    <RowLabel>GET READY TIME</RowLabel>
                    <Pill>{fmtMMSS(cfg.warmupSec)}</Pill>
                </Row>

                {/*  TOGGLES  */}
                <ToggleRow
                    label="SKILL DISPLAY"
                    value={cfg.showSkills}
                    onValueChange={v => setCfg(c => ({ ...c, showSkills: v }))}
                    onMore={goSkillDisplay}
                />
                <ToggleRow
                    label="COMBO DISPLAY"
                    value={cfg.showCombos}
                    onValueChange={v => setCfg(c => ({ ...c, showCombos: v }))}
                    onMore={goComboDisplay}
                />
                <ToggleRow
                    label="MECHANICS DISPLAY"
                    value={cfg.showMechanics}
                    onValueChange={v => setCfg(c => ({ ...c, showMechanics: v }))}
                    onMore={goMechanicsDisplay}
                />

                {/*  actions  */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <PrimaryBtn label="SAVE" onPress={onSave}/>
                    <PrimaryBtn label="START" onPress={onStart} disabled={!canStart}/>
                </View>
            </View>

            {open && (
                <DurationPicker
                    initialSec={
                        open === "round" ? cfg.roundSec : open === "rest" ? cfg.restSec : cfg.warmupSec
                    }
                    onClose={closePicker}
                    onConfirm={setPicked}
                />
            )}
        </SafeAreaView>
    )
}

function Row({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                S.row,
                { backgroundColor: pressed ? colors.pressedBorder : colors.mainBtn },
            ]}
        >
            {children}
        </Pressable>
    )
}

function RowLabel({ children }: { children: React.ReactNode }) {
    return (
        <BodyText style={{ color: colors.offWhite, fontWeight: '800', fontSize: 16 }}>
            {children}
        </BodyText>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <View style={S.pill}>
            <BodyText style={{color: colors.offWhite, fontWeight: '800', fontSize: 16}}>
                {children}
            </BodyText>
        </View>
    );
}

function Counter({ value, onDec, onInc }: { value: number, onDec: () => void; onInc: () => void}) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <SmallBtn label="-" onPress={onDec}/>
            <Pill>{value}</Pill>
            <SmallBtn label="+" onPress={onInc}/>
        </View>
    );
}

function ToggleRow({
    label,
    value,
    onValueChange,
    onMore
}: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    onMore?: () => void;
}) {
    return (
        <View style={[S.row, { backgroundColor: colors.mainBtn, justifyContent: 'space-between' }]}>
            <BodyText style={{ color: colors.offWhite, fontWeight: '800', fontSize: 16 }}>{label}</BodyText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#667", true: colors.text }}
                    thumbColor={value ? colors.mainBtn : "#bbb"}
                />
                {onMore && (
                    <Pressable onPress={onMore} style={({ pressed }) => [S.moreBtn, pressed && { opacity: 0.7 }]}>
                        <BodyText style={{ color: colors.offWhite }}>•••</BodyText>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

function PrimaryBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                S.primaryBtn,
                {
                    backgroundColor: disabled ? "#4b4f64" : pressed ? colors.pressedBorder : colors.text,
                    borderColor: colors.offWhite
                }
            ]}
        >
            <BodyText style={{ fontWeight: '700', fontSize: 18 }}>{label}</BodyText>
        </Pressable>
    );
}

function SmallBtn({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                S.smallBtn,
                { backgroundColor: pressed ? colors.pressedBorder :  "#1f2a44", borderColor: colors.offWhite },
            ]}
            hitSlop={10}
        >
            <BodyText style={{ color: colors.offWhite, fontWeight: '900' }}>{label}</BodyText>
        </Pressable>
    );
}

const S = StyleSheet.create({
    row: {
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.offWhite,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pill: {
        minWidth: 74,
        height: 36,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    primaryBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    smallBtn: {
        width: 38,
        height: 32,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    moreBtn: {
        width: 36,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f2a44",
    },
});