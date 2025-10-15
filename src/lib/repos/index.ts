import type { CombosRepo } from "./combos.repo";
import {supabaseCombosRepo} from "@/lib/repos/combos.repo.supabase";

export const combosRepo: CombosRepo = supabaseCombosRepo;