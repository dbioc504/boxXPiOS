// src/lib/repos/combos.repo.supabase.ts
import { supabase } from "@/lib/supabase";
import { CombosRepo, ComboMeta, ComboId } from "./combos.repo";
import { Movement } from "@/types/common";

function assertAuthed() {
    // (Optional) If you want to hard-fail when no user is present:
    // In Expo RN, supabase-js caches the session; you can also inject user externally.
    return;
}

const mapRowToMeta = (r: any): ComboMeta => ({
    id: r.id,
    name: r.name ?? "New Combo",
    category: r.category ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
});

export const supabaseCombosRepo: CombosRepo = {
    async listCombos() {
        assertAuthed();
        const { data, error } = await supabase
            .from("user_combos")
            .select("id,name,category,created_at,updated_at")
            .order("created_at", { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapRowToMeta);
    },

    async getCombo(id) {
        const { data: metaRow, error: e1 } = await supabase
            .from("user_combos")
            .select("id,name,category,created_at,updated_at")
            .eq("id", id)
            .maybeSingle(); // avoids throw on 0 rows

        if (e1) {
            console.log("getCombo meta error", e1);
            throw e1;
        }
        if (!metaRow) return null;

        const { data: stepRows, error: e2 } = await supabase
            .from("user_combo_steps")
            .select("position,movement") // if movement is a Postgres enum, see step 3
            .eq("combo_id", id)
            .order("position", { ascending: true });

        if (e2) {
            console.log("getCombo steps error", e2);  // visible in Expo logs
            // Return meta with empty steps so UI renders and you can still open the editor
            return { meta: mapRowToMeta(metaRow), steps: [] as Movement[] };
        }

        const steps = (stepRows ?? [])
            .sort((a, b) => a.position - b.position)
            .map(r => r.movement as Movement);

        return { meta: mapRowToMeta(metaRow), steps };
    },

    async createCombo(meta, steps = []) {
        // get the current user so we can satisfy RLS check(user_id = auth.uid())
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user) throw new Error("Not authenticated");

        // include user_id explicitly
        const { data: comboRow, error: e1 } = await supabase
            .from("user_combos")
            .insert({
                user_id: user.id,
                name: meta.name ?? "New Combo",
                category: meta.category ?? null,
            })
            .select("id,name,category,created_at,updated_at")
            .single();

        if (e1) throw e1;
        const combo = mapRowToMeta(comboRow);

        if (steps.length) {
            const payload = steps.map((mv, i) => ({
                combo_id: combo.id,
                position: i,
                movement: mv,
            }));
            const { error: e2 } = await supabase.from("user_combo_steps").insert(payload);
            if (e2) throw e2;
        }
        return combo;
    },

    async updateMeta(id, patch) {
        assertAuthed();
        const { error } = await supabase
            .from("user_combos")
            .update({ name: patch.name, category: patch.category ?? null })
            .eq("id", id);
        if (error) throw error;
    },

    async deleteCombo(id) {
        assertAuthed();
        const { error } = await supabase.from("user_combos").delete().eq("id", id);
        if (error) throw error;
    },

    async saveSteps(id, steps) {
        assertAuthed();

        // Replace all steps (simple + reliable)
        const del = await supabase.from("user_combo_steps").delete().eq("combo_id", id);
        if (del.error) throw del.error;

        if (steps.length) {
            const payload = steps.map((mv, i) => ({
                combo_id: id,
                position: i,
                movement: mv,
            }));
            const ins = await supabase.from("user_combo_steps").insert(payload);
            if (ins.error) throw ins.error;
        }

        // touch updated_at
        await supabase.from("user_combos").update({ updated_at: new Date().toISOString() }).eq("id", id);
    },
};
