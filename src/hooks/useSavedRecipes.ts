"use client";

import { useCallback, useEffect, useState } from "react";
import { LIBRARY_STORAGE_KEY } from "@/lib/constants";
import type { Recipe } from "@/types/recipe";

export function useSavedRecipes() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (raw) setSavedIds(JSON.parse(raw) as string[]);
    } catch {
      setSavedIds([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setSavedIds(ids);
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const isSaved = useCallback(
    (recipeId: string) => savedIds.includes(recipeId),
    [savedIds],
  );

  const toggleSave = useCallback(
    (recipe: Recipe) => {
      const next = isSaved(recipe.id)
        ? savedIds.filter((id) => id !== recipe.id)
        : [...savedIds, recipe.id];
      persist(next);
      return !isSaved(recipe.id);
    },
    [savedIds, isSaved, persist],
  );

  const remove = useCallback(
    (recipeId: string) => {
      persist(savedIds.filter((id) => id !== recipeId));
    },
    [savedIds, persist],
  );

  return { savedIds, loaded, isSaved, toggleSave, remove };
}
