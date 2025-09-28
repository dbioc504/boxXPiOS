import { supabase } from "@/lib/supabase";
import type { CombosRepo, ComboDto, StepDto } from "@/lib/repos/combos.repo";

export const supabaseCombosRepo: CombosRepo = {
    async listCombos(userId) {
         const { data, error } = await supabase
             .from("user_combos")
             .select("id, name, category")
             .eq("user_id", userId)
             .order("created_at", { ascending: false });
         if (error) throw error;
         return data as ComboDto[];
    },

    async createCombo(userId, name, category) {
        const { data, error } = await supabase
            .from("user_combos")
            .insert({ user_id: userId, name, category })
            .select("id, name, category")
            .single();
        if (error) throw error;
        return data as ComboDto;
    },

    async renameCombo(userId, comboId, name) {
        const { data, error } = await supabase
            .from("user_combos")
            .update({ name })
            .eq("id", comboId).eq("user_id", userId)
            .select("id, name, category")
            .single();
        if (error) throw error;
        return data as ComboDto;
    },

    async deleteCombo(userId, comboId) {
        const { error } = await supabase.from("user_combos")
            .delete().eq("id", comboId).eq("user_id", userId);
        if (error) throw error;
    },

    async listSteps(userId, comboId) {
        const { data, error } = await supabase
            .from("user_combo_steps")
            .select("id, combo_id, position, movement")
            .eq("combo_id", comboId)
            .order("position", { ascending: true })
        if (error) throw error;
        return data as StepDto[];
    },

    async insertStep(userId, comboId, movement, position) {
        const { data, error } = await supabase
            .from("user_combo_steps")
            .insert({ combo_id: comboId, movement, position })
            .select("id, combo_id, position, movement")
            .single();
        if (error) throw error;
        return data as StepDto;
    },

    async moveStep(userId, comboId, stepId, toIndex ){
        throw new Error("implement in hook: recompute positions then batch update here");
    },

    async deleteStep(userId, comboId, stepId) {
        const { error } = await supabase
            .from("user_combo_steps")
            .delete()
            .eq("id", stepId).eq("combo_id", comboId);
        if (error) throw error;
    }
};