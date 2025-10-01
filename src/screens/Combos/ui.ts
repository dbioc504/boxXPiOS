export const CHIP_W = 136;
export const CHIP_H = 48;
export const GAP_X = 10;
export const GAP_Y = 10;

export const TIMELINE_PAD = 12;

export const INSERT_TOL = 16;

export function calCols(containerWidth: number) {
    const usable = Math.max(0, containerWidth - TIMELINE_PAD * 2);
    return Math.max(1, Math.floor((usable + GAP_X) / (CHIP_W + GAP_X)));
}