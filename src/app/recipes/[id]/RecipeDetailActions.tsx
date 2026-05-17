"use client";

import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import type { Recipe } from "@/types/recipe";

export function RecipeDetailActions({ recipe }: { recipe: Recipe }) {
  const { loaded, isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <button
      type="button"
      disabled={!loaded}
      onClick={() => void toggleSave(recipe)}
      className={saved ? "btn-primary" : "btn-secondary"}
    >
      {saved ? (
        <>
          <IconBookmarkFilled size={18} />
          Saved to Library
        </>
      ) : (
        <>
          <IconBookmark size={18} />
          Add to Library
        </>
      )}
    </button>
  );
}
