"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import {
  SearchFilterBar,
  type FilterState,
} from "@/components/recipes/SearchFilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import type { Cuisine, Recipe } from "@/types/recipe";

const defaultFilters: FilterState = {
  search: "",
  vegetarian: false,
  nonVegetarian: false,
  spicyLevel: "",
  maxCookingTime: "",
};

export function RecipesClient() {
  const searchParams = useSearchParams();
  const cuisineParam = searchParams.get("cuisine") as Cuisine | null;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (cuisineParam) params.set("cuisine", cuisineParam);
      const res = await fetch(`/api/recipes?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRecipes(data.recipes ?? []);
    } catch {
      setError("Could not load recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cuisineParam]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (
        filters.search &&
        !r.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.vegetarian && !r.isVegetarian) return false;
      if (filters.nonVegetarian && r.isVegetarian) return false;
      if (filters.spicyLevel !== "" && r.spicyLevel !== filters.spicyLevel)
        return false;
      if (
        filters.maxCookingTime !== "" &&
        r.cookingTimeMinutes > filters.maxCookingTime
      )
        return false;
      return true;
    });
  }, [recipes, filters]);

  const title = cuisineParam
    ? `${cuisineParam === "sri-lankan" ? "Sri Lankan" : cuisineParam.charAt(0).toUpperCase() + cuisineParam.slice(1)} Recipes`
    : "All Recipes";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-muted">
          Browse, search, and filter recipes to find your next meal.
        </p>
      </header>

      <SearchFilterBar
        filters={filters}
        cuisine={cuisineParam ?? undefined}
        onChange={setFilters}
      />

      {loading && <LoadingState message="Loading recipes..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="No recipes found"
          description="Try adjusting your filters or explore another cuisine."
          action={
            <Link href="/" className="btn-primary">
              Back home
            </Link>
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
