import type { Category } from "@/types/common";
import type { Technique } from "@/types/technique";
import type { RoundPlan as PlannerRoundPlan } from "@/screens/Timer/planner";

export type TechniqueRef = Technique & { category: Category };
export type RoundPlan = PlannerRoundPlan;
export type SkillPlanSaved = {
    mode: "balanced" | "specialized";
    rounds: number;
    specializedCategory?: Category | null;
    plans: RoundPlan[];
    createdAt: number;
};

export const SKILL_PLAN_STORE_KEY = "skillPlan:v1";