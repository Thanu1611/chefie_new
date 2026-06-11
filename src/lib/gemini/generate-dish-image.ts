import { createHash } from "crypto";
import { buildFoodImageSearchQuery } from "@/lib/images/search-food-image";
import { getRecipeGeminiApiKeys } from "./recipe-sdk";
import { GeminiApiError, logGeminiError } from "./errors";
import type { Cuisine, GeneratedRecipe } from "@/types/recipe";

const GEMINI_IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
  "gemini-3.1-flash-image-preview",
] as const;

const IMAGEN_MODELS = [
  "imagen-4.0-fast-generate-001",
  "imagen-3.0-generate-002",
] as const;

export type GeneratedDishImage = {
  buffer: Buffer;
  mimeType: string;
  source: string;
};

function cuisinePhotoStyle(cuisine: Cuisine): string {
  switch (cuisine) {
    case "sri-lankan":
      return "Sri Lankan Tamil home cooking, coconut-forward, banana leaf or steel plate";
    case "indian":
      return "South Indian home cooking, brass or steel serveware";
    case "chinese":
      return "Chinese home-style wok cooking, ceramic bowl";
  }
}

export function buildDishImagePrompt(recipe: GeneratedRecipe): string {
  const subject = buildFoodImageSearchQuery(recipe);
  const ingredients = recipe.ingredients
    .slice(0, 8)
    .map((i) => i.display_text || i.ingredient_name)
    .join(", ");

  return [
    "Professional food photography of one finished dish only.",
    `Dish: ${subject}.`,
    `Description: ${recipe.image_subject_en ?? recipe.description}`,
    `Cuisine style: ${cuisinePhotoStyle(recipe.cuisine)}.`,
    `Type: ${recipe.dish_type}.`,
    ingredients ? `Key ingredients visible: ${ingredients}.` : "",
    "Single hero shot, natural window light, shallow depth of field, appetizing, realistic textures, no people, no hands, no text, no watermark, no logo, no collage.",
  ]
    .filter(Boolean)
    .join(" ");
}

function extractInlineImage(parts: unknown[]): GeneratedDishImage | null {
  for (const part of parts) {
    if (!part || typeof part !== "object") continue;
    const inline =
      "inlineData" in part
        ? (part as { inlineData?: { data?: string; mimeType?: string } })
            .inlineData
        : "inline_data" in part
          ? (part as { inline_data?: { data?: string; mime_type?: string } })
              .inline_data
          : undefined;

    const data = inline?.data;
    if (!data) continue;

    const mimeType =
      ("mimeType" in (inline ?? {}) &&
        (inline as { mimeType?: string }).mimeType) ||
      ("mime_type" in (inline ?? {}) &&
        (inline as { mime_type?: string }).mime_type) ||
      "image/png";

    return {
      buffer: Buffer.from(data, "base64"),
      mimeType,
      source: "gemini-image",
    };
  }
  return null;
}

async function generateWithGeminiImageModel(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<GeneratedDishImage | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "4:3" },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logGeminiError(`image model ${model}`, body.slice(0, 300));
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: unknown[] } }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const image = extractInlineImage(parts);
  return image ? { ...image, source: model } : null;
}

async function generateWithImagen(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<GeneratedDishImage | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "4:3",
        personGeneration: "dont_allow",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logGeminiError(`imagen ${model}`, body.slice(0, 300));
    return null;
  }

  const data = (await response.json()) as {
    predictions?: Array<{
      bytesBase64Encoded?: string;
      mimeType?: string;
      raiFilteredReason?: string;
    }>;
  };

  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    if (prediction?.raiFilteredReason) {
      logGeminiError(`imagen ${model}`, prediction.raiFilteredReason);
    }
    return null;
  }

  return {
    buffer: Buffer.from(prediction.bytesBase64Encoded, "base64"),
    mimeType: prediction.mimeType ?? "image/png",
    source: model,
  };
}

export async function generateDishImage(
  recipe: GeneratedRecipe,
): Promise<GeneratedDishImage> {
  const apiKeys = getRecipeGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new GeminiApiError({
      code: "NOT_CONFIGURED",
      title: "AI not configured",
      userMessage:
        "Dish image generation needs a Gemini API key with image access.",
      statusCode: 503,
      retryable: false,
    });
  }

  const prompt = buildDishImagePrompt(recipe);

  for (const apiKey of apiKeys) {
    for (const model of GEMINI_IMAGE_MODELS) {
      try {
        const image = await generateWithGeminiImageModel(apiKey, model, prompt);
        if (image) return image;
      } catch (error) {
        logGeminiError(`generateDishImage ${model}`, error);
      }
    }

    for (const model of IMAGEN_MODELS) {
      try {
        const image = await generateWithImagen(apiKey, model, prompt);
        if (image) return image;
      } catch (error) {
        logGeminiError(`generateDishImage ${model}`, error);
      }
    }
  }

  throw new GeminiApiError({
    code: "MODEL_UNAVAILABLE",
    title: "Could not generate dish photo",
    userMessage:
      "The AI could not create a dish photo. Your API key may need billing enabled for image models, or you can try again in a moment.",
    statusCode: 502,
    retryable: true,
  });
}

export function dishImageFilename(
  dishName: string,
  dishSlug: string | undefined,
  buffer: Buffer,
): string {
  const slug =
    dishSlug?.trim() ||
    dishName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    "dish";
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 10);
  return `${slug}-${hash}.jpg`;
}
