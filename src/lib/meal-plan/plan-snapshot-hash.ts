import { createHash } from "crypto";
import type { MealPlanEntry } from "@/types/meal-plan";

/** Stable hash from plan_date + meal_type + dish_id for all plans in a range. */
export function computePlanSnapshotHash(plans: MealPlanEntry[]): string {
  const lines = plans
    .map((p) => `${p.planDate}|${p.mealType}|${p.dishId}`)
    .sort();

  return createHash("sha256").update(lines.join("\n") || "empty").digest("hex");
}
