"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSavedDishes } from "@/hooks/useSavedDishes";
import type { Recipe } from "@/types/recipe";

/** Recipe saves use the same per-user library as dishes (dish_id = recipe.id). */
export function useSavedRecipes() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { saved, loaded, isSaved, toggleSave, remove, isLoggedIn } =
    useSavedDishes();

  const savedIds = saved.map((s) => s.dishId);

  const requireLogin = useCallback(() => {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const redirect = `${pathname}${search}`;
    router.push(
      `/login?redirect=${encodeURIComponent(redirect)}&reason=library`,
    );
  }, [pathname, router]);

  const toggleSaveRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!user) {
        requireLogin();
        return false;
      }
      return toggleSave(recipe.id, recipe.name);
    },
    [user, requireLogin, toggleSave],
  );

  const removeRecipe = useCallback(
    (recipeId: string) => {
      void remove(recipeId);
    },
    [remove],
  );

  return {
    savedIds,
    loaded,
    isSaved,
    toggleSave: toggleSaveRecipe,
    remove: removeRecipe,
    isLoggedIn,
  };
}
