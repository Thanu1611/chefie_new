"use client";

import { useCallback, useEffect, useState } from "react";
import { IconBook2 } from "@tabler/icons-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import type { Recipe } from "@/types/recipe";
import Link from "next/link";

export default function LibraryPage() {
  const { savedIds, loaded } = useSavedRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();
      const all: Recipe[] = data.recipes ?? [];
      setRecipes(all.filter((r: Recipe) => savedIds.includes(r.id)));
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [savedIds]);

  useEffect(() => {
    if (loaded) load();
  }, [loaded, load]);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15">
          <IconBook2 className="h-6 w-6 text-brand" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Library</h1>
          <p className="text-muted">Your saved recipes in one place.</p>
        </div>
      </header>

      {!loaded || loading ? (
        <LoadingState message="Loading your library..." />
      ) : recipes.length === 0 ? (
        <EmptyState
          title="No saved recipes yet"
          description="Tap Add to Library on any recipe to save it here."
          action={
            <Link href="/recipes" className="btn-primary">
              Browse recipes
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
