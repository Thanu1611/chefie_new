import { parseDishIngredients } from "@/lib/dishes/dish-ingredients";
import { resolveDishImageUrl } from "@/lib/dishes/dish-images";
import { getSupabaseAdmin } from "./server";
import type {
  Cuisine,
  Dish,
  DishStep,
  DishWithSteps,
  DishType,
  MealType,
} from "@/types/dish";

type CuisineRow = {
  cuisine_id: string;
  cuisine_name: string;
  image_url: string;
  short_description: string;
};

type DishRow = {
  dish_id: string;
  cuisine_id: string;
  dish_name: string;
  description: string;
  meal_type: string;
  dish_type: string;
  image_url: string;
  prep_time: number;
  cooking_time: number;
  ingredients?: string | null;
};

type StepRow = {
  step_id: number;
  dish_id: string;
  step_number: number;
  title: string;
  instruction: string;
  break_time_minutes: number;
  timer_required: boolean;
  timer_minutes: number | null;
};

function mapCuisine(row: CuisineRow): Cuisine {
  return {
    cuisineId: row.cuisine_id,
    cuisineName: row.cuisine_name,
    imageUrl: row.image_url,
    shortDescription: row.short_description,
  };
}

function mapDish(row: DishRow, cuisine?: Cuisine): Dish {
  return {
    dishId: row.dish_id,
    cuisineId: row.cuisine_id,
    dishName: row.dish_name,
    description: row.description,
    mealType: row.meal_type as MealType,
    dishType: row.dish_type as DishType,
    imageUrl: resolveDishImageUrl(row.dish_name, row.image_url),
    prepTime: row.prep_time,
    cookingTime: row.cooking_time,
    ingredients: parseDishIngredients(row.ingredients),
    cuisine,
  };
}

function mapStep(row: StepRow): DishStep {
  return {
    stepId: row.step_id,
    dishId: row.dish_id,
    stepNumber: row.step_number,
    title: row.title,
    instruction: row.instruction,
    breakTimeMinutes: row.break_time_minutes,
    timerRequired: row.timer_required,
    timerMinutes: row.timer_minutes,
  };
}

export async function getAllCuisines(): Promise<Cuisine[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cuisines")
    .select("*")
    .order("cuisine_name");

  if (error) {
    console.error("getAllCuisines:", error.message);
    return [];
  }

  return (data as CuisineRow[]).map(mapCuisine);
}

export async function getCuisineById(cuisineId: string): Promise<Cuisine | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("cuisines")
    .select("*")
    .eq("cuisine_id", cuisineId)
    .maybeSingle();

  if (error || !data) return null;
  return mapCuisine(data as CuisineRow);
}

export async function getDishesByCuisine(
  cuisineId: string,
  mealType?: MealType,
): Promise<Dish[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("dishes")
    .select("*")
    .eq("cuisine_id", cuisineId)
    .order("meal_type")
    .order("dish_type")
    .order("dish_name");

  if (mealType) {
    query = query.eq("meal_type", mealType);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getDishesByCuisine:", error.message);
    return [];
  }

  const cuisine = await getCuisineById(cuisineId);
  return (data as DishRow[]).map((r) => mapDish(r, cuisine ?? undefined));
}

export async function getDishById(dishId: string): Promise<DishWithSteps | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: dishRow, error: dishError } = await supabase
    .from("dishes")
    .select("*")
    .eq("dish_id", dishId)
    .maybeSingle();

  if (dishError || !dishRow) return null;

  const { data: stepRows, error: stepError } = await supabase
    .from("dish_steps")
    .select("*")
    .eq("dish_id", dishId)
    .order("step_number");

  if (stepError) {
    console.error("getDishSteps:", stepError.message);
    return null;
  }

  const cuisine = await getCuisineById((dishRow as DishRow).cuisine_id);
  return {
    ...mapDish(dishRow as DishRow, cuisine ?? undefined),
    steps: (stepRows as StepRow[]).map(mapStep),
  };
}
