// src/lib/repos/combos.repo.ts
import { Movement } from "@/types/common";

export type ComboId = string;
export type UserId = string;

export type ComboMeta = {
    id: ComboId;
    userId: UserId;
    name: string;
    category?: string | null;
    createdAt: string;
    updatedAt: string;
};

export interface CombosRepo {
    listCombos(userId: UserId): Promise<ComboMeta[]>;
    getCombo(userId: UserId, id: ComboId): Promise<{ meta: ComboMeta; steps: Movement[] } | null>;
    createCombo(
        userId: UserId,
        meta: Partial<Pick<ComboMeta, "name" | "category">>,
        steps?: Movement[]
    ): Promise<ComboMeta>;

    updateMeta(
        userId: UserId,
        id: ComboId,
        patch: Partial<Pick<ComboMeta, 'name' | 'category'>>
    ): Promise<void>;

    renameCombo(userId: UserId, id: ComboId, name: string): Promise<void>;
    deleteCombo(userId: UserId, id: ComboId): Promise<void>;
    saveSteps(userId: UserId, id: ComboId, steps: Movement[]): Promise<void>;
}
