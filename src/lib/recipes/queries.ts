import {
  FALLBACK_RECIPES,
  getFallbackRecipeById,
} from "@/lib/recipes/fallback-recipes";
import type { Cuisine, Recipe, RecipeFilters } from "@/types/recipe";

export async function getAllRecipes(): Promise<{
  recipes: Recipe[];
  source: "fallback";
}> {
  return { recipes: FALLBACK_RECIPES, source: "fallback" };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
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
