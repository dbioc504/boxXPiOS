import type { Technique } from "@/types/technique";
import type { SkillsRepo } from "@/lib/repos/skills.repo";
import {supabase} from "@/lib/supabase";
import {Category} from "@/types/common";
import type { Style } from '@/types/common';
import {TechniqueRow} from "@/types/validation";
import {TECHNIQUES} from "@/lib/fixtures";

export const supabaseSkillsRepo: SkillsRepo = {
    async listUserTechniques(userId, category): Promise<Technique[]> {
        const { data, error } = await supabase
            .from('user_techniques')
            .select('id, title, category')
            .eq('user_id', userId)
            .eq('category', category)
        if (error) throw error;
        return (data ?? []).map(r => ({ id: r.id, title: r.title, category: r.category }));
    },

    async createUserTechnique(
        userId: string,
        category: Category,
        title: string
    ): Promise<Technique> {
        const { data, error } = await supabase
            .from('user_techniques')
            .insert({ user_id: userId, category, title })
            .select('id, title, category')
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            category: data.category as Category,
        }
    },

    async updateUserTechnique(
        userId: string,
        id: string,
        patch: { title?: string }
    ): Promise<Technique> {
        const { data, error } = await supabase
            .from('user_techniques')
            .update({ title: patch.title })
            .eq('id', id)
            .eq('user_id', userId)
            .select('id, title, category')
            .single();

        if (error) throw error;

        return { id: data.id, title: data.title, category: data.category as Category };
    },

    async deleteUserTechnique(
        userId: string,
        id: string
    ): Promise<void> {
        const { error } = await supabase
            .from('user_techniques')
            .delete()
            .eq('id',id)
            .eq('user_id', userId)

        if (error) throw error;
    },

    async getUserStyle(userId: string): Promise<Style | null> {
        const { data, error } = await supabase
            .from('user_styles')
            .select('style')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return (data?.style ?? null) as Style | null;
    },

    async setUserStyle(userId: string, style: Style): Promise<void> {
        const { error } = await supabase
            .from('user_styles')
            .upsert({ user_id: userId, style }, { onConflict: 'user_id' });
        if (error) throw error;
    },

    async listTechniquesByCategory(cat: Category): Promise<TechniqueRow[]> {
        return TECHNIQUES.filter(t => t.category === cat);
    },

    async getUserTechniques(userId: string, cat: Category): Promise<string[]> {
        const { data, error } = await supabase
            .from('user_techniques')
            .select('id')
            .eq('user_id', userId)
            .eq('category', cat)

        if (error) throw error;
        return (data ?? []).map(r => r.id as string);
    },

    async setUserTechniques(userId: string, cat: Category, ids: string[]): Promise<void> {
        const { error: delError } = await supabase
            .from('user_techniques')
            .delete()
            .eq('user_id', userId)
            .eq('category', cat);

        if (delError) throw delError;

        if (!ids?.length) return;

        const byId = new Map<string, TechniqueRow>(TECHNIQUES.map(t => [t.id, t] as const));
        const rows = ids
            .map(id =>{
                const base = byId.get(id);
                if (!base) return null;
                return { user_id: userId, category: cat, title: base.title };
            })
            .filter(Boolean) as Array<{ user_id: string; category: Category; title: string }>;

        if (rows.length === 0) return;

        const { error: insError } = await supabase.from('user_techniques').insert(rows);
        if (insError) throw insError;
    }


}