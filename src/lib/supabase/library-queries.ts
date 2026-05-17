import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedDishEntry } from "@/types/library";

export async function listUserSavedDishes(
  supabase: SupabaseClient,
): Promise<SavedDishEntry[]> {
  const { data, error } = await supabase
    .from("saved_dishes")
    .select("dish_id, dish_name, saved_at")
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("listUserSavedDishes:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    dishId: row.dish_id,
    dishName: row.dish_name ?? row.dish_id,
  }));
}

export async function addUserSavedDish(
  supabase: SupabaseClient,
  userId: string,
  dishId: string,
  dishName: string,
): Promise<boolean> {
  const { error } = await supabase.from("saved_dishes").upsert(
    {
      user_id: userId,
      dish_id: dishId,
      dish_name: dishName,
    },
    { onConflict: "user_id,dish_id" },
  );

  if (error) {
    console.error("addUserSavedDish:", error.message);
    return false;
  }
  return true;
}

export async function removeUserSavedDish(
  supabase: SupabaseClient,
  dishId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("saved_dishes")
    .delete()
    .eq("dish_id", dishId);

  if (error) {
    console.error("removeUserSavedDish:", error.message);
    return false;
  }
  return true;
}
