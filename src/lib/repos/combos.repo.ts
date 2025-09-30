import type { Category, Movement } from "@/types/common";

export type ComboDto = {
    id: string;
    userId: string;
    name?: string;
    category?: Category | null;
};

export type StepDto = {
    id: string;
    comboId: string;
    position: number;
    movement: Movement
};

export interface CombosRepo {
    listCombos(userId: string): Promise<ComboDto[]>;
    createCombo(userId: string, name?: string, category?: Category | null): Promise<ComboDto>;
    renameCombo(userId: string, comboId: string, name: string): Promise<ComboDto>;
    deleteCombo(userId: string, comboId: string): Promise<void>;

    listSteps(userId: string, comboId: string): Promise<StepDto[]>;

    insertStep(userId: string, comboId: string, movement: Movement, position?: number): Promise<StepDto>;
    moveStep(userId: string, comboId: string, stepId: string, toIndex: number): Promise<StepDto[]>;
    deleteStep(userId: string, comboId: string, stepId: string): Promise<void>;
}