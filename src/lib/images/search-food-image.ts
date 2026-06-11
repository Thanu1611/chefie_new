import { sanitizeRemoteImageUrl } from "@/lib/images/remote-image";
import { logGeminiError } from "@/lib/gemini/errors";
import type { GeneratedRecipe } from "@/types/recipe";

const TAMIL_UNICODE = /[\u0B80-\u0BFF]/g;

function cleanLatinText(text: string): string {
  return text.replace(TAMIL_UNICODE, " ").replace(/\s+/g, " ").trim();
}

/** English label for image search / AI photo prompts. */
export function buildFoodImageSearchQuery(recipe: GeneratedRecipe): string {
  const subject = recipe.image_subject_en?.trim();
  if (subject) return subject;

  const ingredientHints = recipe.ingredients
    .map((i) => cleanLatinText(`${i.ingredient_name} ${i.display_text}`))
    .filter((s) => s.length > 1)
    .join(" ");

  const dishLatin = cleanLatinText(recipe.dish_name);
  const descriptionLatin = cleanLatinText(recipe.description);

  const parts = [dishLatin, ingredientHints, descriptionLatin].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ").slice(0, 120);
  }

  return `${recipe.meal_type} ${recipe.cuisine} ${recipe.dish_type} dish`;
}

async function searchWikimediaFoodImage(query: string): Promise<string | null> {
  const search = `${query} food dish`;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: search,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "1200",
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
    { next: { revalidate: 86400 } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          title?: string;
          imageinfo?: Array<{ thumburl?: string; url?: string }>;
        }
      >;
    };
  };

  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const title = page.title?.toLowerCase() ?? "";
    if (
      title.includes("icon") ||
      title.includes("logo") ||
      title.includes("diagram") ||
      title.includes("map") ||
      title.endsWith(".pdf") ||
      title.includes(".pdf")
    ) {
      continue;
    }

    const info = page.imageinfo?.[0];
    const candidate = info?.thumburl ?? info?.url;
    if (candidate && /\.(jpe?g|png|webp)(\?|$)/i.test(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function searchPexelsFoodImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${query} food`)}&per_page=8&orientation=landscape`,
    { headers: { Authorization: apiKey } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    photos?: Array<{
      src?: { large2x?: string; large?: string; medium?: string };
    }>;
  };

  return data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large ?? null;
}

async function searchUnsplashFoodImage(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) return null;

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(`${query} food`)}&per_page=8&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${accessKey}` } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    results?: Array<{ urls?: { regular?: string } }>;
  };

  return data.results?.[0]?.urls?.regular ?? null;
}

/** Find a real food photo online that matches the recipe (Wikimedia, then optional Pexels/Unsplash). */
export async function searchFoodImageOnline(
  recipe: GeneratedRecipe,
): Promise<string | null> {
  const query = buildFoodImageSearchQuery(recipe);
  if (!query) return null;

  const providers = [
    searchWikimediaFoodImage,
    searchPexelsFoodImage,
    searchUnsplashFoodImage,
  ];

  for (const provider of providers) {
    try {
      const url = await provider(query);
      const safe = url ? sanitizeRemoteImageUrl(url) : null;
      if (safe && safe !== "/dish-placeholder.svg") {
        if (process.env.NODE_ENV === "development") {
          console.log(`[food-image] matched "${query}" → ${safe.slice(0, 80)}`);
        }
        return safe;
      }
    } catch (error) {
      logGeminiError("searchFoodImageOnline", error);
    }
  }

  return null;
}
