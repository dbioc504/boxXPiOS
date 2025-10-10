import { useEffect, useRef } from 'react';
import { useDnd } from '@/screens/Combos/DndComponents/DndProvider';

const parseChipIndex = (id: string | null | undefined) => id?.startsWith("chip-") ? Number(id.slice(5)) : null;
const parseSlotIndex = (id: string | null | undefined) => id?.startsWith("slot-") ? Number(id.slice(5)) : null;
const parsePaletteMove = (id: string | null | undefined) => id?.startsWith("palette:") ? id.slice(8) : null;


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
            const fromPalette = parsePaletteMove(dropDragId.value); // <- NEW
            const overChip = parseChipIndex(dropOverId.value);
            const overSlot = parseSlotIndex(dropOverId.value);

            const inChipRange = (n: number | null) => n != null && n >= 0 && n < stepsLen;
            const isEdge = (n: number | null | undefined) => n === 0 || n === stepsLen;
            const isValidSlot = (n: number | null | undefined) => n != null && n >= 0 && n <= stepsLen;

            // chip ↔ chip swap
            if (inChipRange(fromChip) && inChipRange(overChip)) {
                onSwap(fromChip!, overChip!);
                return;
            }
            // chip → edge-slot reorder ONLY
            if (inChipRange(fromChip) && isEdge(overSlot)) {
                onReorder(fromChip!, overSlot!);
                return;
            }
            // palette → ANY slot insert (no swaps with chips)
            if (fromPalette && isValidSlot(overSlot) && onInsertFromPalette) {
                onInsertFromPalette(fromPalette, overSlot!);
                return;
            }
        }, 33);

        return () => { alive = false; clearInterval(t); };
    }, [dropSeq, dropDragId, dropOverId, stepsLen, onSwap, onReorder, onInsertFromPalette]);

    return null;
}

