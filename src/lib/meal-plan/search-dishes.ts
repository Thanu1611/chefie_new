import { and, asc, eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { cuisines, dishes } from "@/lib/db/schema";
import { resolveDishImageUrl } from "@/lib/dishes/dish-images";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DishSearchResult } from "@/types/meal-plan";
import type { DishType, MealType } from "@/types/dish";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
const DISH_TYPES: DishType[] = ["Veg", "Non-Veg"];

export function normalizeMealType(value: string | null | undefined): MealType | undefined {
  if (!value) return undefined;
  return MEAL_TYPES.includes(value as MealType) ? (value as MealType) : undefined;
}

export function normalizeDishType(value: string | null | undefined): DishType | undefined {
  if (!value) return undefined;
  return DISH_TYPES.includes(value as DishType) ? (value as DishType) : undefined;
}

async function searchDishesWithDrizzle(
  query: string,
  mealType?: MealType,
  dishType?: DishType,
): Promise<DishSearchResult[]> {
  if (!db) return [];

  const filters = [];
  if (mealType) filters.push(eq(dishes.mealType, mealType));
  if (dishType) filters.push(eq(dishes.dishType, dishType));
  const trimmed = query.trim();
  if (trimmed) filters.push(ilike(dishes.dishName, `%${trimmed}%`));

  const rows = await db
    .select({
      dishId: dishes.dishId,
      dishName: dishes.dishName,
      description: dishes.description,
      mealType: dishes.mealType,
      dishType: dishes.dishType,
      cuisineId: dishes.cuisineId,
      imageUrl: dishes.imageUrl,
      prepTime: dishes.prepTime,
      cookingTime: dishes.cookingTime,
      baseServings: dishes.baseServings,
      cuisineName: cuisines.cuisineName,
    })
    .from(dishes)
    .innerJoin(cuisines, eq(dishes.cuisineId, cuisines.cuisineId))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(dishes.dishName))
    .limit(24);

  return rows.map((row) => ({
    dishId: row.dishId,
    dishName: row.dishName,
    description: row.description,
    mealType: row.mealType as MealType,
    dishType: row.dishType as DishType,
    cuisineId: row.cuisineId,
    cuisineName: row.cuisineName,
    imageUrl: resolveDishImageUrl(row.dishName, row.imageUrl),
    prepTime: row.prepTime,
    cookingTime: row.cookingTime,
    baseServings:
      row.baseServings != null && row.baseServings > 0 ? row.baseServings : 2,
  }));
}

type DishRow = {
  dish_id: string;
  dish_name: string;
  description: string;
  meal_type: string;
  dish_type: string;
  cuisine_id: string;
  image_url: string;
  prep_time: number;
  cooking_time: number;
  base_servings?: number | null;
};

async function loadCuisineNames(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  cuisineIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (cuisineIds.length === 0) return map;

  const { data, error } = await supabase
    .from("cuisines")
    .select("cuisine_id, cuisine_name")
    .in("cuisine_id", cuisineIds);

  if (error) {
    console.error("searchDishesForMealPlan cuisines:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    map.set(row.cuisine_id, row.cuisine_name);
  }
  return map;
}

function mapSupabaseDishRow(
  row: DishRow,
  cuisineMap: Map<string, string>,
): DishSearchResult {
  return {
    dishId: row.dish_id,
    dishName: row.dish_name,
    description: row.description,
    mealType: row.meal_type as MealType,
    dishType: row.dish_type as DishType,
    cuisineId: row.cuisine_id,
    cuisineName: cuisineMap.get(row.cuisine_id) ?? row.cuisine_id,
    imageUrl: resolveDishImageUrl(row.dish_name, row.image_url),
    prepTime: row.prep_time,
    cookingTime: row.cooking_time,
    baseServings:
      row.base_servings != null && Number(row.base_servings) > 0
        ? Number(row.base_servings)
        : 2,
  };
}

async function searchDishesWithSupabase(
  query: string,
  mealType?: MealType,
  dishType?: DishType,
): Promise<DishSearchResult[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const baseSelect =
    "dish_id, dish_name, description, meal_type, dish_type, cuisine_id, image_url, prep_time, cooking_time, base_servings";

  let q = supabase.from("dishes").select(baseSelect).order("dish_name").limit(24);

  if (mealType) q = q.eq("meal_type", mealType);
  if (dishType) q = q.eq("dish_type", dishType);
  const trimmed = query.trim();
  if (trimmed) q = q.ilike("dish_name", `%${trimmed}%`);

  const primary = await q;
  let rows: DishRow[] = [];

  if (primary.error) {
    const missingColumn =
      primary.error.message.includes("base_servings") ||
      primary.error.message.includes("column");
    if (!missingColumn) {
      console.error("searchDishesForMealPlan:", primary.error.message, {
        mealType,
        dishType,
        query,
      });
      return [];
    }

    let fallback = supabase
      .from("dishes")
      .select(
        "dish_id, dish_name, description, meal_type, dish_type, cuisine_id, image_url, prep_time, cooking_time",
      )
      .order("dish_name")
      .limit(24);
    if (mealType) fallback = fallback.eq("meal_type", mealType);
    if (dishType) fallback = fallback.eq("dish_type", dishType);
    if (trimmed) fallback = fallback.ilike("dish_name", `%${trimmed}%`);
    const fallbackResult = await fallback;
    if (fallbackResult.error) {
      console.error("searchDishesForMealPlan:", fallbackResult.error.message, {
        mealType,
        dishType,
        query,
      });
      return [];
    }
    rows = (fallbackResult.data ?? []) as unknown as DishRow[];
  } else {
    rows = (primary.data ?? []) as unknown as DishRow[];
  }
  const cuisineIds = [...new Set(rows.map((r) => r.cuisine_id))];
  const cuisineMap = await loadCuisineNames(supabase, cuisineIds);

  return rows.map((row) => mapSupabaseDishRow(row, cuisineMap));
}

/** Public predefined dishes only — never filtered by user_id. */
export async function searchDishesForMealPlan(
  query: string,
  mealType?: MealType,
  dishType?: DishType,
): Promise<DishSearchResult[]> {
  if (db) {
    try {
      return await searchDishesWithDrizzle(query, mealType, dishType);
    } catch (e) {
      console.error("Drizzle searchDishesForMealPlan failed, using Supabase:", e);
    }
  }

  return searchDishesWithSupabase(query, mealType, dishType);
}
