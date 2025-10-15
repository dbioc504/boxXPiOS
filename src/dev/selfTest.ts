// src/dev/selfTest.ts
import { supabase } from "@/lib/supabase";

export async function probeStepsOnce() {
    const { data, error, status } = await supabase
        .from("user_combo_steps")
        .select("combo_id, position, movement")
        .limit(1);

    console.log("probe steps status", status);
    console.log("probe steps error", error);
    console.log("probe steps data", data);
}
