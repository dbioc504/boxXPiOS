import type { CombosRepo, ComboDto, StepDto } from "@/lib/repos/combos.repo";
import { nanoid } from "nanoid/non-secure";

export function makeMockCombosRepo(): CombosRepo {
    const combos: ComboDto[] = [];
    const stepsByCombo = new Map<string, StepDto[]>();
    return {
        async listCombos(_userId) { return combos; },
        async createCombo(_userId, name, category) {
            const id = nanoid(); const row = { id, name, category };
            combos.unshift(row); return row;
        },
        async renameCombo(_userId, comboId, name) {
            const row = combos.find(c => c.id === comboId)!; row.name = name; return row;
        },
        async deleteCombo(_userId, comboId) {
            const i = combos.findIndex(c => c.id === comboId)!; if (i >= 0) combos.splice(i,1);
            stepsByCombo.delete(comboId);
        },
        async listSteps(_userId, comboId) {
            return (stepsByCombo.get(comboId) ?? []).slice().sort((a,b) => a.position - b.position);
        },
        async insertStep(_userId, comboId, movement, position) {
            const arr = stepsByCombo.get(comboId) ?? []; stepsByCombo.set(comboId, arr);
            const pos = position ?? arr.length; const id = nanoid();
            const row = { id, combo_id: comboId, position: pos, movement };
            arr.splice(pos, 0, row); arr.forEach((s,i) => s.position = i); return row;
        },
        async moveStep(_userId, comboId, stepId, toIndex) {
            const arr = stepsByCombo.get(comboId) ?? []; const i = arr.findIndex(s=>s.id===stepId);
            const [m] = arr.splice(i,1); arr.splice(toIndex,0,m); arr.forEach((s,i) => s.position = i); return m;
        },
        async deleteStep(_userId, comboId, stepId) {
            const arr = stepsByCombo.get(comboId) ?? []; const i = arr.findIndex(s=>s.id===stepId);
            if (i>=0) arr.splice(i,1); arr.forEach((s,i) => s.position = i);
        }
    }
}