import { getSupabaseAdmin } from "@/lib/supabase/server";
import { buildDishSeeds, CUISINE_SEED } from "./seed-data";

export async function seedViaSupabase(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error: tableCheck } = await supabase.from("cuisines").select("cuisine_id").limit(1);
  if (tableCheck?.message?.includes("does not exist") || tableCheck?.code === "42P01") {
    return false;
  }

  await supabase.from("dish_steps").delete().gte("step_id", 0);
  await supabase.from("dishes").delete().neq("dish_id", "");
  await supabase.from("cuisines").delete().neq("cuisine_id", "");

  const { error: cErr } = await supabase.from("cuisines").insert(
    CUISINE_SEED.map((c) => ({
      cuisine_id: c.cuisineId,
      cuisine_name: c.cuisineName,
      image_url: c.imageUrl,
      short_description: c.shortDescription,
    })),
  );
  if (cErr) return false;

  for (const dish of buildDishSeeds()) {
    const { steps, ...row } = dish;
    const { error: dErr } = await supabase.from("dishes").insert({
      dish_id: row.dishId,
      cuisine_id: row.cuisineId,
      dish_name: row.dishName,
      description: row.description,
      meal_type: row.mealType,
      dish_type: row.dishType,
      image_url: row.imageUrl,
      prep_time: row.prepTime,
      cooking_time: row.cookingTime,
    });
    if (dErr) return false;

    const { error: sErr } = await supabase.from("dish_steps").insert(
      steps.map((step, i) => ({
        dish_id: row.dishId,
        step_number: i + 1,
        title: step.title,
        instruction: step.instruction,
        break_time_minutes: step.breakTimeMinutes ?? 0,
        timer_required: step.timerRequired ?? false,
        timer_minutes: step.timerMinutes ?? null,
      })),
    );
    if (sErr) return false;
  }

  return true;
}
