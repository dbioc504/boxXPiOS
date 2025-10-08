import React, {useEffect, useRef, useState} from "react";
import { View, Text, StyleSheet } from "react-native";
import {DndProvider, useDnd} from "@/screens/Combos/DndComponents/DndProvider";
import { Draggable } from "@/screens/Combos/DndComponents/Draggable";
import { Droppable } from "@/screens/Combos/DndComponents/Droppable";


function DropListener({ onDrop }: { onDrop: (dragId: string|null, overId: string|null) => void }) {
    const { dropSeq, dropDragId, dropOverId } = useDnd();
    const lastSeq = useRef<number>(-1);

    useEffect(() => {
        let alive = true;
        const interval = setInterval(() => {
            if (!alive) return;
            const seq = dropSeq.value;                 // reading SV in an effect is OK
            if (seq !== lastSeq.current) {
                lastSeq.current = seq;
                try {
                    onDrop(dropDragId.value ?? null, dropOverId.value ?? null);
                } catch (e) {
                    console.error('drop handler error', e);
                }
            }
        }, 33); // ~30fps

        return () => {
            alive = false;
            clearInterval(interval);
        };
    }, [dropSeq, dropDragId, dropOverId, onDrop]);

    return null;
}

export default function DndPlaygroundScreen() {
    const [lastDrop, setLastDrop] = useState<string | null>(null);

    return (
        <DndProvider>

            <DropListener onDrop={(_, over) => setLastDrop(over)}/>

            <View style={S.root}>
                <View style={S.row}>
                    <Draggable
                        id="drag-1"
                        style={[S.box, { backgroundColor: "#8e8af7" }]}
                    >
                        <Text style={S.txt}>Drag me</Text>
                    </Draggable>

                    <Droppable
                        id="drop-1"
                        style={[S.box]}
                        overBorderColor="#4b6cff"
                        idleBorderColor="transparent"
                        overBg="rgba(75,108,255,0.25)"
                        idleBg="#0b0b2a"
                    >
                        <Text style={[S.txt, { color: "white" }]}>Drop here</Text>
                    </Droppable>

                </View>

                <Text style={S.status}>Last drop: {lastDrop ?? "none"}</Text>
            </View>
        </DndProvider>
    );
}

const S = StyleSheet.create({
    root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 24 },
    row: { flexDirection: "row", gap: 24, alignItems: "center" },
    box: { width: 120, height: 120, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    txt: { fontSize: 16, fontWeight: "700" },
    status: { color: "#ccd" },
});
