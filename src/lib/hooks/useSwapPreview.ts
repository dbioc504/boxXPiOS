// useSwapPreview.ts
import { useEffect, useRef, useState } from 'react';
import { useDnd } from '@/screens/Combos/DndComponents/DndProvider';

export type SwapPreview = {
    fromIndex: number | null;
    overIndex: number | null;
    targetIsChip: boolean;
};

const parseChipIndex = (id: string | null | undefined) => {
    if (!id || !id.startsWith('chip-')) return null;
    const n = Number(id.slice(5));
    return Number.isFinite(n) ? n : null;
};

export function useSwapPreview(): SwapPreview {
    const { hoverChipId, dragFromIndex, dragActive } = useDnd();
    const [state, setState] = useState<SwapPreview>({ fromIndex: null, overIndex: null, targetIsChip: false });
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    useEffect(() => {
        let alive = true;
        const tick = () => {
            if (!alive) return;
            const isDragging = dragActive.value === 1;

            if (!isDragging) {
                // Clear preview on drag end if anything was set
                const s = stateRef.current;
                if (s.fromIndex !== null || s.overIndex !== null || s.targetIsChip) {
                    setState({ fromIndex: null, overIndex: null, targetIsChip: false });
                }
            } else {
                const from = dragFromIndex.value;
                const overChip = parseChipIndex(hoverChipId.value);
                const shouldShow = from != null && overChip != null;

                const next: SwapPreview = shouldShow
                    ? { fromIndex: from!, overIndex: overChip!, targetIsChip: true }
                    : { fromIndex: null, overIndex: null, targetIsChip: false };

                const s = stateRef.current;
                if (
                    s.fromIndex !== next.fromIndex ||
                    s.overIndex !== next.overIndex ||
                    s.targetIsChip !== next.targetIsChip
                ) {
                    setState(next);
                }
            }
            requestAnimationFrame(tick);
        };
        const raf = requestAnimationFrame(tick);
        return () => { alive = false; cancelAnimationFrame(raf); };
    }, [dragActive, dragFromIndex, hoverChipId]);

    return state;
}