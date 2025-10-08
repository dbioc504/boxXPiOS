import React, { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

export type Rect = { x: number; y: number; width: number; height: number; };

type Ctx = {
    rects: SharedValue<Record<string, Rect>>;
    overId: SharedValue<string | null>;
    dropDragId: SharedValue<string | null>;
    dropOverId: SharedValue<string | null>;
    dropSeq: SharedValue<number>;
    dragActive: SharedValue<number>;
};

const DndCtx = createContext<Ctx | null>(null);

export function DndProvider({ children }: PropsWithChildren) {
    const rects = useSharedValue<Record<string, Rect>>({});
    const overId = useSharedValue<string | null>(null);
    const dropDragId = useSharedValue<string | null>(null);
    const dropOverId = useSharedValue<string | null>(null);
    const dropSeq = useSharedValue(0);
    const dragActive = useSharedValue(0);

    const value = useMemo(
        () => ({ rects, overId, dropDragId, dropOverId, dropSeq, dragActive }),
        []
    );

    return <DndCtx.Provider value={value}>{children}</DndCtx.Provider>
}

export function useDnd() {
    const ctx = useContext(DndCtx);
    if (!ctx) throw new Error('DndProvider is missing');
    return ctx;
}

