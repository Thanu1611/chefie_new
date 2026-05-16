export type GeminiErrorCode =
  | "QUOTA_EXCEEDED"
  | "INVALID_API_KEY"
  | "PERMISSION_DENIED"
  | "MODEL_UNAVAILABLE"
  | "RATE_LIMITED"
  | "NETWORK"
  | "PARSE_ERROR"
  | "NOT_CONFIGURED"
  | "UNKNOWN";

export class GeminiApiError extends Error {
  readonly code: GeminiErrorCode;
  readonly title: string;
  readonly userMessage: string;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(opts: {
    code: GeminiErrorCode;
    title: string;
    userMessage: string;
    statusCode?: number;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(opts.userMessage);
    this.name = "GeminiApiError";
    this.code = opts.code;
    this.title = opts.title;
    this.userMessage = opts.userMessage;
    this.statusCode = opts.statusCode ?? 500;
    this.retryable = opts.retryable ?? true;
    if (opts.cause) this.cause = opts.cause;
  }
}

type GeminiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export function logGeminiError(context: string, error: unknown): void {
  console.error(`[Gemini] ${context}:`, error);
}

export function parseGeminiHttpError(
  httpStatus: number,
  bodyText: string,
): GeminiApiError {
  let parsed: GeminiErrorBody = {};
  try {
    parsed = JSON.parse(bodyText) as GeminiErrorBody;
  } catch {
    /* raw text fallback */
  }

  const apiMessage = parsed.error?.message ?? bodyText;
  const apiStatus = parsed.error?.status?.toUpperCase();
  const lower = apiMessage.toLowerCase();

  if (
    httpStatus === 404 ||
    (lower.includes("not found") && lower.includes("model"))
  ) {
    return new GeminiApiError({
      code: "MODEL_UNAVAILABLE",
      title: "AI model unavailable",
      userMessage: `Model not available: ${apiMessage.slice(0, 120)}`,
      statusCode: 404,
      retryable: false,
    });
  }

  if (
    httpStatus === 429 ||
    apiStatus === "RESOURCE_EXHAUSTED" ||
    (lower.includes("quota") && !lower.includes("invalid api")) ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return new GeminiApiError({
      code: "QUOTA_EXCEEDED",
      title: "AI quota reached",
      userMessage:
        "The recipe generator has hit its API limit. Wait a few minutes and try again, or check your Gemini API plan and billing at Google AI Studio.",
      statusCode: 429,
      retryable: true,
    });
  }

  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    lower.includes("api key") ||
    lower.includes("permission") ||
    apiStatus === "PERMISSION_DENIED" ||
    apiStatus === "UNAUTHENTICATED"
  ) {
    return new GeminiApiError({
      code: httpStatus === 401 ? "INVALID_API_KEY" : "PERMISSION_DENIED",
      title: "API key problem",
      userMessage:
        "The Gemini API key is missing or invalid. Add a valid NEXT_PUBLIC_GEMINI_API_KEY in your .env file and restart the dev server.",
      statusCode: httpStatus === 401 ? 401 : 403,
      retryable: false,
    });
  }

  if (httpStatus === 503 || httpStatus === 502 || lower.includes("unavailable")) {
    return new GeminiApiError({
      code: "MODEL_UNAVAILABLE",
      title: "AI temporarily unavailable",
      userMessage:
        "Gemini is temporarily unavailable. Please try again in a few minutes.",
      statusCode: 503,
      retryable: true,
    });
  }

  if (httpStatus >= 500) {
    return new GeminiApiError({
      code: "UNKNOWN",
      title: "Server error",
      userMessage:
        "Something went wrong on the AI service. Please try again shortly.",
      statusCode: httpStatus,
      retryable: true,
    });
  }

  return new GeminiApiError({
    code: "UNKNOWN",
    title: "Could not generate recipe",
    userMessage:
      "We couldn't create a recipe right now. Check your ingredients and try again.",
    statusCode: httpStatus,
    retryable: true,
  });
}

function extractHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as Record<string, unknown>;
  if (typeof err.status === "number") return err.status;
  if (typeof err.statusCode === "number") return err.statusCode;
  return undefined;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function toGeminiApiError(error: unknown): GeminiApiError {
  if (error instanceof GeminiApiError) return error;

  const httpStatus = extractHttpStatus(error);
  const message = extractErrorMessage(error);
  if (httpStatus != null) {
    return parseGeminiHttpError(httpStatus, message);
  }

  if (error instanceof Error) {
    if (error.message.includes("Gemini API key is not configured")) {
      return new GeminiApiError({
        code: "NOT_CONFIGURED",
        title: "AI not configured",
        userMessage:
          "Recipe generation needs a Gemini API key. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.",
        statusCode: 503,
        retryable: false,
      });
    }

    if (error.message.startsWith("Gemini API error:")) {
      const raw = error.message.replace(/^Gemini API error:\s*/, "");
      try {
        const parsed = JSON.parse(raw) as GeminiErrorBody;
        const code = parsed.error?.code ?? 500;
        return parseGeminiHttpError(
          typeof code === "number" ? code : 500,
          raw,
        );
      } catch {
        return parseGeminiHttpError(500, raw);
      }
    }

    if (
      error.message.includes("fetch failed") ||
      error.message.includes("network")
    ) {
      return new GeminiApiError({
        code: "NETWORK",
        title: "Connection problem",
        userMessage:
          "Couldn't reach the AI service. Check your internet connection and try again.",
        statusCode: 503,
        retryable: true,
      });
    }

    if (error.message.includes("JSON") || error.message.includes("No recipe")) {
      return new GeminiApiError({
        code: "PARSE_ERROR",
        title: "Unexpected AI response",
        userMessage:
          "The AI returned an invalid recipe format. Please try generating again.",
        statusCode: 502,
        retryable: true,
      });
    }
  }

  return new GeminiApiError({
    code: "UNKNOWN",
    title: "Something went wrong",
    userMessage: "We couldn't generate your recipe. Please try again.",
    statusCode: 500,
    retryable: true,
  });
}

export type ApiErrorPayload = {
  error: string;
  title: string;
  code: GeminiErrorCode;
  retryable: boolean;
};

export function geminiErrorToPayload(error: GeminiApiError): ApiErrorPayload {
  return {
    error: error.userMessage,
    title: error.title,
    code: error.code,
    retryable: error.retryable,
  };
}
