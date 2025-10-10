import { useEffect, useRef } from 'react';
import { useDnd } from '@/screens/Combos/DndComponents/DndProvider';

const parseChipIndex = (id: string | null | undefined) => {
    if (!id || !id.startsWith('chip-')) return null;
    const n = Number(id.slice(5));
    return Number.isFinite(n) ? n : null;
};

const parseSlotIndex = (id: string | null | undefined) => {
    if (!id || !id.startsWith('slot-')) return null;
    const n = Number(id.slice(5));
    return Number.isFinite(n) ? n : null;
};

const parsePaletteMove = (id: string | null | undefined) => {
    if (!id || !id.startsWith('palette:')) return null;
    return id.slice('palette:'.length) as any;
};

export function CombosDropListener({
    stepsLen,
    onSwap,
    onReorder,
    onInsertFromPalette,
}: {
    stepsLen: number;
    onSwap: (a: number, b: number) => void;
    onReorder: (from: number, toSlotIndex: number) => void;
    onInsertFromPalette?: (moveKey: string, toSlotIndex: number) => void;
}) {
    const { dropSeq, dropDragId, dropOverId } = useDnd();
    const lastSeq = useRef(-1);

    useEffect(() => {
        let alive = true;
        const t = setInterval(() => {
            if (!alive) return;
            const seq = dropSeq.value;
            if (seq === lastSeq.current) return;
            lastSeq.current = seq;

            const fromChip = parseChipIndex(dropDragId.value);
            const fromPaletteMove = parsePaletteMove(dropDragId.value);
            const overChip = parseChipIndex(dropOverId.value);
            const overSlot = parseSlotIndex(dropOverId.value);

            const inChipRange = (n: number | null) => n != null && n >= 0 && n < stepsLen;
            const isEdgeSlot = (s: number | null | undefined) => s === 0 || s === stepsLen;

            if (inChipRange(fromChip) && inChipRange(overChip)) {
                onSwap(fromChip!, overChip);
                return;
            }

            if (inChipRange(fromChip) && isEdgeSlot(overSlot)) {
                onReorder(fromChip!, overSlot!);
                return;
            }

            if (fromPaletteMove && isEdgeSlot(overSlot) && onInsertFromPalette) {
                onInsertFromPalette(fromPaletteMove, overSlot!);
                return;
            }
        }, 33);

        return () => { alive = false; clearInterval(t); };
    }, [dropSeq, dropDragId, dropOverId, stepsLen, onSwap, onReorder, onInsertFromPalette]);

    return null;
}

