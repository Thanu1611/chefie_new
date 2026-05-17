import { NextResponse } from "next/server";
import {
  normalizeDishType,
  normalizeMealType,
  searchDishesForMealPlan,
} from "@/lib/meal-plan/search-dishes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const selectedMealType = normalizeMealType(searchParams.get("mealType"));
  const selectedDiet = searchParams.get("diet");
  const selectedDietType = normalizeDishType(
    selectedDiet === "All" ? null : selectedDiet,
  );

  try {
    const dishes = await searchDishesForMealPlan(
      q,
      selectedMealType,
      selectedDietType,
    );
    return NextResponse.json({ dishes });
  } catch (e) {
    console.error("GET /api/meal-plans/dishes:", e);
    return NextResponse.json(
      { error: "Failed to search dishes" },
      { status: 500 },
    );
  }
}
