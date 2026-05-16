import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiApiError, logGeminiError, toGeminiApiError } from "./errors";

/** Primary model (matches Book Buddy pattern); fallbacks if quota/unavailable. */
const RECIPE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
] as const;

export type RecipeGeminiModelId = (typeof RECIPE_MODELS)[number];

/** Server-side keys first; keeps existing NEXT_PUBLIC_GEMINI_API_KEY working. */
export function getRecipeGeminiApiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k));

  return [...new Set(candidates)];
}

function logKeyLoaded(keys: string[]): void {
  if (process.env.NODE_ENV === "development" && keys[0]) {
    console.log("Gemini Key Loaded:", `${keys[0].slice(0, 10)}…`);
  }
}

function isRetryableGeminiError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: number; message?: string };
  const status = err.status;
  const lower = (err.message ?? "").toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    status === 404 ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("not found") ||
    lower.includes("unavailable")
  );
}

export type RecipeGeminiGenerateOptions = {
  systemInstruction: string;
  userPrompt: string;
  json?: boolean;
  temperature?: number;
};

export type RecipeGeminiGenerateResult = {
  text: string;
  model: RecipeGeminiModelId;
};

/**
 * Recipe generator Gemini client — official SDK, systemInstruction, key fallback.
 * Used only by AI Recipe Generator (not help / voice).
 */
export async function generateRecipeWithGeminiSdk(
  options: RecipeGeminiGenerateOptions,
): Promise<RecipeGeminiGenerateResult> {
  const apiKeys = getRecipeGeminiApiKeys();
  logKeyLoaded(apiKeys);

  if (apiKeys.length === 0) {
    throw new GeminiApiError({
      code: "NOT_CONFIGURED",
      title: "AI not configured",
      userMessage:
        "Recipe generation needs a Gemini API key. Add GEMINI_API_KEY (or NEXT_PUBLIC_GEMINI_API_KEY) to your .env file and restart the dev server.",
      statusCode: 503,
      retryable: false,
    });
  }

  const { systemInstruction, userPrompt, json = true, temperature = 0.7 } =
    options;

  let lastError: unknown;

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    const genAI = new GoogleGenerativeAI(apiKey);

    if (keyIndex > 0 && process.env.NODE_ENV === "development") {
      console.log(`[Gemini] Trying fallback API key #${keyIndex + 1}…`);
    }

    for (const modelId of RECIPE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction,
          generationConfig: {
            temperature,
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();

        if (process.env.NODE_ENV === "development") {
          console.log(`[Gemini] recipe success — model: ${modelId}`);
        }

        return { text, model: modelId };
      } catch (error) {
        logGeminiError(`recipe SDK (${modelId}, key ${keyIndex + 1})`, error);
        lastError = error;

        if (isRetryableGeminiError(error)) {
          continue;
        }

        throw toGeminiApiError(error);
      }
    }
  }

  throw toGeminiApiError(lastError);
}
