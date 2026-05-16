import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { recipes as recipesTable } from "@/lib/db/schema";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  FALLBACK_RECIPES,
  getFallbackRecipeById,
} from "@/lib/recipes/fallback-recipes";
import type { Cuisine, Recipe, RecipeFilters } from "@/types/recipe";

function rowToRecipe(row: {
  external_id?: string;
  externalId?: string;
  id?: string;
  name: string;
  cuisine: string;
  image: string;
  description?: string | null;
  cooking_time_minutes?: number;
  cookingTimeMinutes?: number;
  difficulty: string;
  servings: number;
  is_vegetarian?: boolean;
  isVegetarian?: boolean;
  spicy_level?: number;
  spicyLevel?: number;
  ingredients: unknown;
  steps: unknown;
}): Recipe {
  return {
    id: row.external_id ?? row.externalId ?? String(row.id),
    name: row.name,
    cuisine: row.cuisine as Cuisine,
    image: row.image,
    description: row.description ?? undefined,
    cookingTimeMinutes:
      row.cooking_time_minutes ?? row.cookingTimeMinutes ?? 30,
    difficulty: row.difficulty as Recipe["difficulty"],
    servings: row.servings,
    isVegetarian: row.is_vegetarian ?? row.isVegetarian ?? false,
    spicyLevel: (row.spicy_level ?? row.spicyLevel ?? 0) as Recipe["spicyLevel"],
    ingredients: row.ingredients as Recipe["ingredients"],
    steps: row.steps as Recipe["steps"],
  };
}

export async function fetchRecipesFromDrizzle(): Promise<Recipe[] | null> {
  if (!db) return null;
  try {
    const rows = await db.select().from(recipesTable);
    if (rows.length === 0) return null;
    return rows.map((r) =>
      rowToRecipe({
        externalId: r.externalId,
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        image: r.image,
        description: r.description,
        cookingTimeMinutes: r.cookingTimeMinutes,
        difficulty: r.difficulty,
        servings: r.servings,
        isVegetarian: r.isVegetarian,
        spicyLevel: r.spicyLevel,
        ingredients: r.ingredients,
        steps: r.steps,
      }),
    );
  } catch {
    return null;
  }
}

export async function fetchRecipesFromSupabase(): Promise<Recipe[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from("recipes").select("*");
    if (error || !data?.length) return null;
    return data.map((row) => rowToRecipe(row));
  } catch {
    return null;
  }
}

export async function getAllRecipes(): Promise<{
  recipes: Recipe[];
  source: "drizzle" | "supabase" | "fallback";
}> {
  const fromDrizzle = await fetchRecipesFromDrizzle();
  if (fromDrizzle?.length) {
    return { recipes: fromDrizzle, source: "drizzle" };
  }

  const fromSupabase = await fetchRecipesFromSupabase();
  if (fromSupabase?.length) {
    return { recipes: fromSupabase, source: "supabase" };
  }

  return { recipes: FALLBACK_RECIPES, source: "fallback" };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(recipesTable)
        .where(eq(recipesTable.externalId, id))
        .limit(1);
      if (row) {
        return rowToRecipe({
          externalId: row.externalId,
          name: row.name,
          cuisine: row.cuisine,
          image: row.image,
          description: row.description,
          cookingTimeMinutes: row.cookingTimeMinutes,
          difficulty: row.difficulty,
          servings: row.servings,
          isVegetarian: row.isVegetarian,
          spicyLevel: row.spicyLevel,
          ingredients: row.ingredients,
          steps: row.steps,
        });
      }
    } catch {
      /* fall through */
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("external_id", id)
        .maybeSingle();
      if (data) return rowToRecipe(data);
    } catch {
      /* fall through */
    }
  }

  return getFallbackRecipeById(id) ?? null;
}

export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
): Recipe[] {
  return recipes.filter((recipe) => {
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!recipe.name.toLowerCase().includes(q)) return false;
    }

    if (filters.vegetarian && !recipe.isVegetarian) return false;
    if (filters.nonVegetarian && recipe.isVegetarian) return false;

    if (
      filters.spicyLevel != null &&
      recipe.spicyLevel !== filters.spicyLevel
    ) {
      return false;
    }

    if (
      filters.maxCookingTime != null &&
      recipe.cookingTimeMinutes > filters.maxCookingTime
    ) {
      return false;
    }

    return true;
  });
}
