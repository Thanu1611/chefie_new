import { asc, eq } from "drizzle-orm";
import { parseDishIngredients } from "@/lib/dishes/dish-ingredients";
import { db } from "./index";
import { cuisines, dishes, dishSteps } from "./schema";
import * as supabaseQueries from "@/lib/supabase/queries";
import type {
  Cuisine,
  Dish,
  DishStep,
  DishWithSteps,
  DishType,
  MealType,
} from "@/types/dish";

function mapCuisine(row: typeof cuisines.$inferSelect): Cuisine {
  return {
    cuisineId: row.cuisineId,
    cuisineName: row.cuisineName,
    imageUrl: row.imageUrl,
    shortDescription: row.shortDescription,
  };
}

function mapDish(row: typeof dishes.$inferSelect, cuisine?: Cuisine): Dish {
  return {
    dishId: row.dishId,
    cuisineId: row.cuisineId,
    dishName: row.dishName,
    description: row.description,
    mealType: row.mealType as MealType,
    dishType: row.dishType as DishType,
    imageUrl: row.imageUrl,
    prepTime: row.prepTime,
    cookingTime: row.cookingTime,
    ingredients: parseDishIngredients(row.ingredients),
    cuisine,
  };
}

function mapStep(row: typeof dishSteps.$inferSelect): DishStep {
  return {
    stepId: row.stepId,
    dishId: row.dishId,
    stepNumber: row.stepNumber,
    title: row.title,
    instruction: row.instruction,
    breakTimeMinutes: row.breakTimeMinutes,
    timerRequired: row.timerRequired,
    timerMinutes: row.timerMinutes,
  };
}

async function fromDrizzle<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (db) {
    try {
      return await fn();
    } catch (e) {
      console.error("Drizzle query failed, using Supabase:", e);
    }
  }
  return fallback();
}

export async function getAllCuisines(): Promise<Cuisine[]> {
  return fromDrizzle(async () => {
    const rows = await db!.select().from(cuisines).orderBy(asc(cuisines.cuisineName));
    return rows.map(mapCuisine);
  }, supabaseQueries.getAllCuisines);
}

export async function getCuisineById(cuisineId: string): Promise<Cuisine | null> {
  return fromDrizzle(async () => {
    const [row] = await db!
      .select()
      .from(cuisines)
      .where(eq(cuisines.cuisineId, cuisineId))
      .limit(1);
    return row ? mapCuisine(row) : null;
  }, () => supabaseQueries.getCuisineById(cuisineId));
}

export async function getDishesByCuisine(
  cuisineId: string,
  mealType?: MealType,
): Promise<Dish[]> {
  return fromDrizzle(async () => {
    const rows = await db!
      .select()
      .from(dishes)
      .where(eq(dishes.cuisineId, cuisineId))
      .orderBy(asc(dishes.mealType), asc(dishes.dishType), asc(dishes.dishName));
    const filtered = mealType ? rows.filter((r) => r.mealType === mealType) : rows;
    const cuisine = await getCuisineById(cuisineId);
    return filtered.map((r) => mapDish(r, cuisine ?? undefined));
  }, () => supabaseQueries.getDishesByCuisine(cuisineId, mealType));
}

export async function getDishById(dishId: string): Promise<DishWithSteps | null> {
  return fromDrizzle(async () => {
    const [dishRow] = await db!
      .select()
      .from(dishes)
      .where(eq(dishes.dishId, dishId))
      .limit(1);
    if (!dishRow) return null;
    const cuisine = await getCuisineById(dishRow.cuisineId);
    const stepRows = await db!
      .select()
      .from(dishSteps)
      .where(eq(dishSteps.dishId, dishId))
      .orderBy(asc(dishSteps.stepNumber));
    return {
      ...mapDish(dishRow, cuisine ?? undefined),
      steps: stepRows.map(mapStep),
    };
  }, () => supabaseQueries.getDishById(dishId));
}

export async function getDishSteps(dishId: string): Promise<DishStep[]> {
  const dish = await getDishById(dishId);
  return dish?.steps ?? [];
}
