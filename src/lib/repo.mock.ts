import { TECHNIQUES, COMBOS, MECHANICS } from "@/lib/fixtures";

import type {
    TechniqueRow, ComboTemplateRow, MechanicRow
} from "@/types/validation";

export async function listTechniques(): Promise<TechniqueRow[]> {
    return TECHNIQUES;
}

export async function listTechniquesByCategory(
    category: TechniqueRow['category']
): Promise<TechniqueRow[]> {
    return TECHNIQUES.filter((t) => t.category === category);
}

export async function listCombos(): Promise<ComboTemplateRow[]> {
    return COMBOS;
}

export async function getComboById(
    id: ComboTemplateRow['id']
): Promise<ComboTemplateRow | null> {
    return COMBOS.find((c) => c.id === id) ?? null;
}

export async function listMechanics(): Promise<MechanicRow[]> {
    return MECHANICS;
}

export async function listMechanicsByMovement(
    movement: MechanicRow['movement']
): Promise<MechanicRow[]> {
    return MECHANICS.filter((m) => m.movement === movement);
}

