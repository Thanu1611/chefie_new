import { NextRequest, NextResponse } from "next/server";
import { addGeneratedDishToDatabase } from "@/lib/db/insert-generated-dish";
import type { GeneratedRecipe } from "@/types/recipe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipe = body.recipe as GeneratedRecipe | undefined;

    if (!recipe?.dish_name?.trim()) {
      return NextResponse.json(
        { error: "Invalid recipe payload." },
        { status: 400 },
      );
    }

    const result = await addGeneratedDishToDatabase(recipe);

    if (result.status === "duplicate") {
      return NextResponse.json({
        status: "duplicate",
        message: "This recipe already exists in your predefined dishes.",
      });
    }

    if (result.status === "error") {
      return NextResponse.json(
        { status: "error", message: result.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Recipe added successfully.",
      dishId: result.dishId,
    });
  } catch (error) {
    console.error("POST /api/dishes/add-generated:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to save recipe.",
      },
      { status: 500 },
    );
  }
}
