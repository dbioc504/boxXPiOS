import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/theme/T";
import { sharedStyle } from "@/theme/theme";

import { DndProvider, type DndProviderProps } from "@mgcrea/react-native-dnd";
import { runOnJS } from "react-native-reanimated";

import MovementPalette from "@/screens/Combos/MovementPalette";
import ComboTimelineGrid from "@/screens/Combos/ComboTimelineGrid";

import { mockCombosRepo } from "@/lib/repos/combos.repo.mock";
import { useComboBuilder } from "@/lib/hooks/useComboBuilder"; // accepts { userId?, comboId?, repo? }

const USER_ID = "mock-user-1";

export default function ComboScreen() {
    const [comboId, setComboId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const mine = await mockCombosRepo.listCombos(USER_ID);
                if (!mounted) return;
                if (mine.length > 0) setComboId(mine[0].id);
                else {
                    const created = await mockCombosRepo.createCombo(USER_ID, { name: "My First Combo" }, []);
                    if (!mounted) return;
                    setComboId(created.id);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (loading || !comboId) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    return <ComboScreenInner userId={USER_ID} comboId={comboId} />;
}

function ComboScreenInner({ userId, comboId }: { userId: string; comboId: string }) {
    const { steps, append, replaceAll } = useComboBuilder({ userId, comboId, repo: mockCombosRepo });

    // Called by the DnD provider (runs on UI thread), so jump back to JS with runOnJS
    const onDragEnd = useCallback<DndProviderProps["onDragEnd"]>(({ active, over }) => {
        "worklet";
        if (!over) return;
        if (over.id === "timeline-drop") {
            const payload = active.data?.value as { movement?: string } | undefined;
            if (payload?.movement) {
                runOnJS(append)(payload.movement as any); // Movement is a string union
            }
        }
    }, [append]);

    return (
        <SafeAreaView style={sharedStyle.safeArea}>
            <Header title="COMBOS" />
            <DndProvider onDragEnd={onDragEnd}>
                <MovementPalette
                    // tap-to-add still works:
                    onPressChip={append}
                />
                <ComboTimelineGrid
                    steps={steps}
                    onReorder={(next) => replaceAll(next)}
                />
            </DndProvider>
        </SafeAreaView>
    );
}
