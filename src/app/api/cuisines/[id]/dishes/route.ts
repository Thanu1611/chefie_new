import { NextResponse } from "next/server";
import { getCuisineById, getDishesByCuisine } from "@/lib/db/queries";
import type { MealType } from "@/types/dish";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const mealType = searchParams.get("mealType") as MealType | null;

  try {
    const cuisine = await getCuisineById(id);
    if (!cuisine) {
      return NextResponse.json({ error: "Cuisine not found" }, { status: 404 });
    }

    const dishList = await getDishesByCuisine(
      id,
      mealType ?? undefined,
    );

    return NextResponse.json({ cuisine, dishes: dishList });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dishes" },
      { status: 500 },
    );
  }
}
