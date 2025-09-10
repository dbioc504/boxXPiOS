export type Style = 'outboxer' | 'boxer_puncher' | 'infighter';

export interface TechniqueRow {
    id: string;
    title: string;
    category: string;
}

export interface SkillsRepo {
    getUserStyle(userId: string): Promise<Style | null>;
    setUserStyle(userId: string, style: Style): Promise<void>;

    listTechniquesByCategory(cat: string): Promise<TechniqueRow[]>;

    getUserTechniques(userId: string, cat: string): Promise<string[]>
    setUserTechniques(userId: string, cat: string, ids: string[]): Promise<void>;
}
