import { NextResponse } from "next/server";
import { getAllRecipes, filterRecipes } from "@/lib/recipes/queries";
import type { Cuisine } from "@/types/recipe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cuisine = searchParams.get("cuisine") as Cuisine | null;
  const search = searchParams.get("search") ?? undefined;
  const vegetarian = searchParams.get("vegetarian") === "true";
  const nonVegetarian = searchParams.get("nonVegetarian") === "true";
  const spicyLevel = searchParams.get("spicyLevel");
  const maxCookingTime = searchParams.get("maxCookingTime");

  try {
    const { recipes, source } = await getAllRecipes();
    const filtered = filterRecipes(recipes, {
      cuisine: cuisine ?? undefined,
      search,
      vegetarian: vegetarian || null,
      nonVegetarian: nonVegetarian || null,
      spicyLevel:
        spicyLevel != null ? (Number(spicyLevel) as 0 | 1 | 2 | 3) : null,
      maxCookingTime: maxCookingTime ? Number(maxCookingTime) : null,
    });

    return NextResponse.json({ recipes: filtered, source });
  } catch {
    return NextResponse.json(
      { error: "Failed to load recipes" },
      { status: 500 },
    );
  }
}
