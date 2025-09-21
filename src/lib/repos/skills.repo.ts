import {Category} from "@/types/common";
import {Technique} from "@/types/technique";
import { TechniqueRow } from "@/types/validation";


export type Style = 'outboxer' | 'boxer_puncher' | 'infighter';


export interface SkillsRepo {
    listUserTechniques:(userId: string, category: Category) => Promise<Technique[]>
    createUserTechnique: (userId: string, category: Category, title: string) => Promise<Technique>
    updateUserTechnique: (userId: string, id: string, patch: { title?: string }) => Promise<void>;
    deleteUserTechnique: (userId: string, id: string) => Promise<void>;

    getUserStyle(userId: string): Promise<Style | null>;
    setUserStyle(userId: string, style: Style): Promise<void>;
    listTechniquesByCategory: (cat: Category) => Promise<TechniqueRow[]>;
    getUserTechniques(userId: string, cat: string): Promise<string[]>
    setUserTechniques(userId: string, cat: string, ids: string[]): Promise<void>;
}
