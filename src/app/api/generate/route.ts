import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { generateRecipeWithGemini } from "@/lib/gemini/generate-recipe";
import {
  GeminiApiError,
  geminiErrorToPayload,
  logGeminiError,
  toGeminiApiError,
} from "@/lib/gemini/errors";
import type { Cuisine } from "@/types/recipe";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ingredients, cuisine } = body as {
      ingredients?: string;
      cuisine?: Cuisine;
    };

    if (!ingredients?.trim()) {
      return NextResponse.json(
        {
          error: "Please enter at least one ingredient.",
          title: "Missing ingredients",
          code: "UNKNOWN",
          retryable: false,
        },
        { status: 400 },
      );
    }

    const validCuisines: Cuisine[] = ["chinese", "indian", "sri-lankan"];
    if (!cuisine || !validCuisines.includes(cuisine)) {
      return NextResponse.json(
        {
          error: "Please select a valid cuisine.",
          title: "Invalid cuisine",
          code: "UNKNOWN",
          retryable: false,
        },
        { status: 400 },
      );
    }

    const recipe = await generateRecipeWithGemini(ingredients.trim(), cuisine);
    return NextResponse.json({ recipe });
  } catch (error) {
    logGeminiError("POST /api/generate", error);
    const geminiError =
      error instanceof GeminiApiError ? error : toGeminiApiError(error);
    return NextResponse.json(geminiErrorToPayload(geminiError), {
      status: geminiError.statusCode,
    });
  }
}
