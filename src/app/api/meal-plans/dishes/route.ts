import { NextResponse } from "next/server";
import { searchDishesForMealPlan } from "@/lib/supabase/meal-plan-queries";
import type { DishType, MealType } from "@/types/dish";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mealType = searchParams.get("mealType") as MealType | null;
  const diet = searchParams.get("diet");
  const dishType =
    diet === "Veg" || diet === "Non-Veg" ? (diet as DishType) : undefined;

  try {
    const dishes = await searchDishesForMealPlan(
      q,
      mealType ?? undefined,
      dishType,
    );
    return NextResponse.json({ dishes });
  } catch {
    return NextResponse.json({ error: "Failed to search dishes" }, { status: 500 });
  }
}
