import React, {useEffect, useMemo, useState} from "react";
import {Alert, Pressable, StyleSheet, Switch, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useNavigation} from "@react-navigation/native";
import {BodyText, Header} from "@/theme/T";
import {colors, sharedStyle} from "@/theme/theme";
import {fmtMMSS} from "@/lib/time";
import {CustomTimePicker} from "@/screens/Timer/CustomTimePicker";
import {DEFAULT_TIMER_CONFIG, TIMER_STORE_KEY, TimerConfig} from "@/types/timer";
import type {RootStackParamList} from "@/navigation/RootNavigator";
import {Ionicons} from "@expo/vector-icons";
import SkillDisplayModal from "@/screens/Timer/SkillDisplayModal";

type Nav = NativeStackScreenProps<RootStackParamList, "TimerSetup">["navigation"];

type OpenPickerTarget = null | "rounds" | "round" | "rest" | "warmup";

export default function TimerSetupScreen() {
    const nav = useNavigation<Nav>();
    const [cfg, setCfg] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
    const [open, setOpen] = useState<OpenPickerTarget>(null);
    const [showSkillModal, setShowSkillModal] = useState(false);

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


    const openPicker = (t: OpenPickerTarget) => setOpen(t);
    const closePicker = () => setOpen(null);
    const setPicked = (value: number) => {
        if (open === 'rounds') setCfg(c => ({ ...c, rounds: value }));
        if (open === 'round') setCfg(c => ({ ...c, roundSec: value }));
        if (open === 'rest') setCfg(c => ({ ...c, restSec: value }));
        if (open === 'warmup') setCfg(c => ({ ...c, warmupSec: value }));
        closePicker();
    };

    const goSkillDisplay = () => setShowSkillModal(true);
    const goComboDisplay = () => nav.navigate("ComboDisplay");
    const goMechanicsDisplay = () => nav.navigate("MechanicsDisplay");

    const onStart = () => {
        nav.navigate("TimerRun");
    };

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="TIMER"/>

            <View style={{ paddingHorizontal: 12, gap: 12 }}>
                {/*  ROUNDS  */}
                <Row onPress={() => openPicker("rounds")}>
                    <RowLabel>ROUNDS</RowLabel>
                    <Pill>{cfg.rounds}</Pill>
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
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <PrimaryBtn label="START" onPress={onStart}/>
                </View>

                <SkillDisplayModal
                    visible={showSkillModal}
                    onClose={() => setShowSkillModal(false)}
                    onSaved={() => {
                        setShowSkillModal(false)
                    }}
                />
            </View>

            {open && (
                <CustomTimePicker
                    mode={
                        open === "rounds" ? "rounds" :
                        open === "round" ? "roundTime" :
                        open === "rest" ? "restTime" : "getReadyTime"
                    }
                    initialValue={
                        open === "rounds" ? cfg.rounds :
                        open === "round" ? cfg.roundSec :
                        open === "rest" ? cfg.restSec : cfg.warmupSec
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
                { opacity: pressed ? 0.7 : 1 },
                pressed && {
                    backgroundColor: colors.signIn,
                    transform: [{ scale: 1.02 }],
                    borderColor: colors.form
                },
            ]}
        >
            {children}
        </Pressable>
    )
}

function RowLabel({ children }: { children: React.ReactNode }) {
    return (
        <BodyText style={{ color: colors.offWhite, fontWeight: '700', fontSize: 16 }}>
            {children}
        </BodyText>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <View style={S.pill}>
            <BodyText style={{color: colors.offWhite, fontWeight: '700', fontSize: 20}}>
                {children}
            </BodyText>
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
        <View style={[S.row, { backgroundColor: colors.mainBtn, justifyContent: 'space-between', height: 70, borderWidth: 0 }]}>
            <BodyText style={{ color: colors.offWhite, fontWeight: '600', fontSize: 16 }}>{label}</BodyText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#667", true: colors.text }}
                    thumbColor={value ? colors.mainBtn : "#bbb"}
                />
                {onMore && (
                    <Pressable onPress={onMore} style={({ pressed }) => [S.moreBtn, pressed && { opacity: 0.7 }]}>
                        <Ionicons name='cog-outline' color={colors.offWhite} size={30}/>
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
                    backgroundColor: disabled ? "#4b4f64" : pressed ?'#225322' : colors.timerStart,
                }
            ]}
        >
            <BodyText style={{ fontWeight: '700', fontSize: 18, color: 'white' }}>{label}</BodyText>
        </Pressable>
    );
}

const S = StyleSheet.create({
    row: {
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.offWhite,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.mainBtn
    },
    pill: {
        minWidth: 74,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        backgroundColor: colors.categories
    },
    primaryBtn: {
        flex: 1,
        height: 80,
        borderRadius: 14,
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.offWhite,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f2a44",
    },
});