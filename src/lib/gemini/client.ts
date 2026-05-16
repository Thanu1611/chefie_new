import { GeminiApiError, logGeminiError, parseGeminiHttpError } from "./errors";

/** Tried in order until one succeeds (free-tier friendly first). */
export const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash",
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number];

export function getGeminiApiKey(): string | undefined {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

  if (process.env.NODE_ENV === "development") {
    console.log("Gemini Key Loaded:", apiKey ? `${apiKey.slice(0, 10)}…` : "(missing)");
  }

  return apiKey || undefined;
}

export function requireGeminiApiKey(): string {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiApiError({
      code: "NOT_CONFIGURED",
      title: "AI not configured",
      userMessage:
        "Recipe generation needs a Gemini API key. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env file and restart the dev server.",
      statusCode: 503,
      retryable: false,
    });
  }
  return apiKey;
}

function geminiGenerateUrl(model: GeminiModelId): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export type GeminiGenerateOptions = {
  prompt: string;
  temperature?: number;
  json?: boolean;
};

export type GeminiGenerateResult = {
  text: string;
  model: GeminiModelId;
};

export async function generateWithGemini(
  options: GeminiGenerateOptions,
): Promise<GeminiGenerateResult> {
  const apiKey = requireGeminiApiKey();
  const { prompt, temperature = 0.7, json = false } = options;

  let lastQuotaError: GeminiApiError | null = null;

  for (const model of GEMINI_MODELS) {
    let response: Response;
    try {
      response = await fetch(`${geminiGenerateUrl(model)}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      });
    } catch (networkError) {
      logGeminiError(`network error (${model})`, networkError);
      throw new GeminiApiError({
        code: "NETWORK",
        title: "Connection problem",
        userMessage:
          "Couldn't reach the AI service. Check your internet connection and try again.",
        statusCode: 503,
        retryable: true,
        cause: networkError,
      });
    }

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (process.env.NODE_ENV === "development") {
        console.log(`[Gemini] success with model: ${model}`);
      }
      return { text, model };
    }

    const errText = await response.text();
    logGeminiError(`HTTP ${response.status} (${model})`, errText);

    const parsed = parseGeminiHttpError(response.status, errText);

    if (parsed.code === "QUOTA_EXCEEDED" || parsed.code === "RATE_LIMITED") {
      lastQuotaError = parsed;
      continue;
    }

    if (parsed.code === "MODEL_UNAVAILABLE" && response.status === 404) {
      continue;
    }

    throw parsed;
  }

  throw (
    lastQuotaError ??
    new GeminiApiError({
      code: "QUOTA_EXCEEDED",
      title: "AI quota reached",
      userMessage:
        "All Gemini models hit their API limit. Wait a few minutes, enable billing in Google AI Studio, or try again later.",
      statusCode: 429,
      retryable: true,
    })
  );
}
