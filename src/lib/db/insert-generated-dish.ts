import { and, eq, sql } from "drizzle-orm";
import { buildDishId } from "@/lib/dishes/dish-id";
import { db } from "./index";
import { dishIngredients, dishSteps, dishes } from "./schema";
import {
  mapGeneratedIngredientsToRows,
} from "@/lib/supabase/insert-generated-dish";
import * as supabaseQueries from "@/lib/supabase/insert-generated-dish";
import type { GeneratedRecipe } from "@/types/recipe";

export type AddGeneratedDishResult =
  | { status: "success"; dishId: string }
  | { status: "duplicate" }
  | { status: "error"; message: string };

async function fromDrizzle<T>(
  fn: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (db) {
    try {
      return await fn();
    } catch (e) {
      console.error("Drizzle insert failed, using Supabase:", e);
    }
  }
  return fallback();
}

export async function dishExistsByName(
  cuisineId: string,
  dishName: string,
): Promise<boolean> {
  return fromDrizzle(
    async () => {
      const [row] = await db!
        .select({ dishId: dishes.dishId })
        .from(dishes)
        .where(
          and(
            eq(dishes.cuisineId, cuisineId),
            sql`lower(${dishes.dishName}) = lower(${dishName})`,
          ),
        )
        .limit(1);
      return Boolean(row);
    },
    () => supabaseQueries.dishExistsByName(cuisineId, dishName),
  );
}

export async function addGeneratedDishToDatabase(
  recipe: GeneratedRecipe,
): Promise<AddGeneratedDishResult> {
  const cuisineId = recipe.cuisine_id;
  const dishName = recipe.dish_name.trim();

  if (!dishName) {
    return { status: "error", message: "Recipe name is missing." };
  }

  if (await dishExistsByName(cuisineId, dishName)) {
    return { status: "duplicate" };
  }

  let dishId = buildDishId(
    cuisineId,
    recipe.meal_type,
    recipe.dish_type,
    dishName,
    recipe.dish_slug,
  );

  const dishRow = {
    dishId,
    cuisineId,
    dishName,
    description: recipe.description,
    mealType: recipe.meal_type,
    dishType: recipe.dish_type,
    imageUrl: recipe.image_url,
    prepTime: recipe.prep_time,
    cookingTime: recipe.cooking_time,
  };

  const stepRows = [...recipe.steps]
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => ({
      dishId,
      stepNumber: step.step_number,
      title: step.title,
      instruction: step.instruction,
      breakTimeMinutes: step.break_time_minutes ?? 0,
      timerRequired: step.timer_required ?? false,
      timerMinutes: step.timer_minutes,
    }));

  if (stepRows.length === 0) {
    return { status: "error", message: "Recipe has no cooking steps." };
  }

  if (recipe.ingredients.length === 0) {
    return { status: "error", message: "Recipe has no ingredients." };
  }

  const ingredientRows = mapGeneratedIngredientsToRows(dishId, recipe.ingredients);

  return fromDrizzle(
    async () => {
      const rollback = async () => {
        await db!.delete(dishes).where(eq(dishes.dishId, dishId));
      };

      try {
        try {
          await db!.insert(dishes).values(dishRow);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("duplicate key") || msg.includes("unique")) {
            if (await dishExistsByName(cuisineId, dishName)) {
              return { status: "duplicate" };
            }
            dishId = `${dishId}-${Date.now()}`;
            dishRow.dishId = dishId;
            stepRows.forEach((s) => {
              s.dishId = dishId;
            });
            ingredientRows.forEach((row) => {
              row.dishId = dishId;
            });
            await db!.insert(dishes).values(dishRow);
          } else {
            throw e;
          }
        }

        await db!.insert(dishSteps).values(stepRows);
        await db!.insert(dishIngredients).values(
          ingredientRows.map((row) => ({
            dishId: row.dishId,
            ingredientName: row.ingredientName,
            quantity: row.quantity != null ? String(row.quantity) : null,
            unit: row.unit,
            displayText: row.displayText,
          })),
        );
        return { status: "success", dishId };
      } catch (e) {
        await rollback();
        const msg = e instanceof Error ? e.message : "Failed to save recipe.";
        return { status: "error", message: msg };
      }
    },
    () => supabaseQueries.insertGeneratedDish(dishRow, stepRows, ingredientRows),
  );
}
