// src/screens/Combos/ComboScreen.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { BodyText, Header } from "@/theme/T";
import ComboBuilder from "@/screens/Combos/ComboBuilder";
import { mockCombosRepo } from "@/lib/repos/combos.repo.mock";
import { useComboBuilder } from "@/lib/hooks/useComboBuilder";
import {SafeAreaView} from "react-native-safe-area-context";
import {sharedStyle} from "@/theme/theme";

const USER_ID = "mock-user-1";

export default function ComboScreen() {
    const [comboId, setComboId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const mine = await mockCombosRepo.listCombos(USER_ID);
            if (mine.length) setComboId(mine[0].id);
            else {
                const created = await mockCombosRepo.createCombo(USER_ID, "My First Combo", null);
                setComboId(created.id);
            }
        })();
    }, []);

    if (!comboId) {
        return (
            <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
                <ActivityIndicator />
                <BodyText>Preparing your combo…</BodyText>
            </View>
        );
    }

    return <ComboScreenInner userId={USER_ID} comboId={comboId} />;
}

function ComboScreenInner({ userId, comboId }: { userId: string; comboId: string }) {
    const { steps, loading, insertAt, moveTo } = useComboBuilder({
        userId,
        comboId,
        repo: mockCombosRepo,
    });

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="COMBOS" />
            <ComboBuilder steps={steps} insertAt={insertAt} moveTo={moveTo} />
            {loading ? null : null}
        </SafeAreaView>
    );
}
