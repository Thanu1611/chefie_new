import { NextResponse } from "next/server";
import { generateRecipeWithGemini } from "@/lib/gemini/generate-recipe";
import type { Cuisine } from "@/types/recipe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredients, cuisine } = body as {
      ingredients?: string;
      cuisine?: Cuisine;
    };

    if (!ingredients?.trim()) {
      return NextResponse.json(
        { error: "Please enter at least one ingredient." },
        { status: 400 },
      );
    }

    const validCuisines: Cuisine[] = ["chinese", "indian", "sri-lankan"];
    if (!cuisine || !validCuisines.includes(cuisine)) {
      return NextResponse.json(
        { error: "Please select a valid cuisine." },
        { status: 400 },
      );
    }

    const recipe = await generateRecipeWithGemini(ingredients.trim(), cuisine);
    return NextResponse.json({ recipe });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
