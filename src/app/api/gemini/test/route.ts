import { NextResponse } from "next/server";
import {
  GeminiApiError,
  geminiErrorToPayload,
  logGeminiError,
  toGeminiApiError,
} from "@/lib/gemini/errors";
import { generateRecipeWithGeminiSdk } from "@/lib/gemini/recipe-sdk";

export async function GET() {
  try {
    const { text, model } = await generateRecipeWithGeminiSdk({
      systemInstruction:
        'You are Chefie. Reply briefly in plain text. No JSON.',
      userPrompt: "Say hello",
      json: false,
      temperature: 0.2,
    });

    return NextResponse.json({
      ok: true,
      model,
      response: text.trim() || "(empty response)",
    });
  } catch (error) {
    logGeminiError("GET /api/gemini/test", error);
    const geminiError =
      error instanceof GeminiApiError ? error : toGeminiApiError(error);
    return NextResponse.json(
      { ok: false, ...geminiErrorToPayload(geminiError) },
      { status: geminiError.statusCode },
    );
  }
}
