import { formatSupabaseError } from "./db-errors";
import { getSupabaseAdmin } from "./server";
import type { AddGeneratedDishResult } from "@/lib/db/insert-generated-dish";
import type { GeneratedIngredient } from "@/types/recipe";

type DishInsertRow = {
  dishId: string;
  cuisineId: string;
  dishName: string;
  description: string;
  mealType: string;
  dishType: string;
  imageUrl: string;
  prepTime: number;
  cookingTime: number;
};

type StepInsertRow = {
  dishId: string;
  stepNumber: number;
  title: string;
  instruction: string;
  breakTimeMinutes: number;
  timerRequired: boolean;
  timerMinutes: number | null;
};

type IngredientInsertRow = {
  dishId: string;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  displayText: string;
};

export async function dishExistsByName(
  cuisineId: string,
  dishName: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("dishes")
    .select("dish_name")
    .eq("cuisine_id", cuisineId);

  if (error) {
    console.error("dishExistsByName:", error.message);
    return false;
  }

  const lower = dishName.toLowerCase();
  return (data ?? []).some(
    (row) => String(row.dish_name).toLowerCase() === lower,
  );
}

export async function insertGeneratedDish(
  dishRow: DishInsertRow,
  stepRows: StepInsertRow[],
  ingredientRows: IngredientInsertRow[],
): Promise<AddGeneratedDishResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: "error",
      message: "Database is not configured.",
    };
  }

  const { error: dishError } = await supabase.from("dishes").insert({
    dish_id: dishRow.dishId,
    cuisine_id: dishRow.cuisineId,
    dish_name: dishRow.dishName,
    description: dishRow.description,
    meal_type: dishRow.mealType,
    dish_type: dishRow.dishType,
    image_url: dishRow.imageUrl,
    prep_time: dishRow.prepTime,
    cooking_time: dishRow.cookingTime,
  });

  if (dishError) {
    if (dishError.message.includes("duplicate")) {
      const exists = await dishExistsByName(dishRow.cuisineId, dishRow.dishName);
      if (exists) return { status: "duplicate" };
    }
    return { status: "error", message: formatSupabaseError(dishError.message) };
  }

  const { error: stepsError } = await supabase.from("dish_steps").insert(
    stepRows.map((s) => ({
      dish_id: s.dishId,
      step_number: s.stepNumber,
      title: s.title,
      instruction: s.instruction,
      break_time_minutes: s.breakTimeMinutes,
      timer_required: s.timerRequired,
      timer_minutes: s.timerMinutes,
    })),
  );

  if (stepsError) {
    await supabase.from("dishes").delete().eq("dish_id", dishRow.dishId);
    return { status: "error", message: formatSupabaseError(stepsError.message) };
  }

  if (ingredientRows.length > 0) {
    const { error: ingredientsError } = await supabase.from("dish_ingredients").insert(
      ingredientRows.map((row) => ({
        dish_id: row.dishId,
        ingredient_name: row.ingredientName,
        quantity: row.quantity,
        unit: row.unit,
        display_text: row.displayText,
      })),
    );

    if (ingredientsError) {
      await supabase.from("dishes").delete().eq("dish_id", dishRow.dishId);
      return { status: "error", message: formatSupabaseError(ingredientsError.message) };
    }
  }

  return { status: "success", dishId: dishRow.dishId };
}

export function mapGeneratedIngredientsToRows(
  dishId: string,
  ingredients: GeneratedIngredient[],
): IngredientInsertRow[] {
  return ingredients.map((ing) => ({
    dishId,
    ingredientName: ing.ingredient_name,
    quantity: ing.quantity,
    unit: ing.unit,
    displayText: ing.display_text,
  }));
}
