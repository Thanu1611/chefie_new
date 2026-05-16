import { getTemplateIngredients } from "@/lib/dishes/dish-ingredient-templates";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DishIngredient } from "@/types/dish-ingredient";

type IngredientRow = {
  id: number;
  dish_id: string;
  ingredient_name: string;
  quantity: number | string | null;
  unit: string | null;
  display_text: string;
};

function mapRow(row: IngredientRow): DishIngredient {
  const qty =
    row.quantity == null
      ? null
      : typeof row.quantity === "number"
        ? row.quantity
        : Number(row.quantity);

  return {
    id: row.id,
    dishId: row.dish_id,
    ingredientName: row.ingredient_name,
    quantity: Number.isFinite(qty) ? qty : null,
    unit: row.unit,
    displayText: row.display_text,
  };
}

export async function getDishIngredientsByDishId(
  dishId: string,
  dishName: string,
): Promise<DishIngredient[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getTemplateIngredients(dishName);

  const { data, error } = await supabase
    .from("dish_ingredients")
    .select("id, dish_id, ingredient_name, quantity, unit, display_text")
    .eq("dish_id", dishId)
    .order("id");

  if (error || !data?.length) {
    return getTemplateIngredients(dishName);
  }

  return (data as IngredientRow[]).map(mapRow);
}

export async function getDishBaseServings(dishId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 2;

  const { data, error } = await supabase
    .from("dishes")
    .select("base_servings")
    .eq("dish_id", dishId)
    .maybeSingle();

  if (error || data?.base_servings == null) return 2;
  const n = Number(data.base_servings);
  return n > 0 ? n : 2;
}
