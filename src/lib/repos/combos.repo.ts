// src/lib/repos/combos.repo.ts
import { Movement } from "@/types/common";

export type ComboId = string;

export type ComboMeta = {
    id: ComboId;
    // You usually don’t need userId in the UI layer; omit it from the public type.
    name: string;
    category?: string | null;
    createdAt: string;  // ISO string
    updatedAt: string;  // ISO string
};

export interface CombosRepo {
    // All methods act on “current user” implicitly (via Supabase session + RLS)
    listCombos(): Promise<ComboMeta[]>;

    getCombo(id: ComboId): Promise<{ meta: ComboMeta; steps: Movement[] } | null>;

    createCombo(
        meta: Partial<Pick<ComboMeta, "name" | "category">>,
        steps?: Movement[]
    ): Promise<ComboMeta>;

    updateMeta(
        id: ComboId,
        patch: Partial<Pick<ComboMeta, "name" | "category">>
    ): Promise<void>;

    deleteCombo(id: ComboId): Promise<void>;

    saveSteps(id: ComboId, steps: Movement[]): Promise<void>;
}
