import { appCuisineToDbId } from "@/lib/dishes/cuisine-map";
import type { Cuisine, GeneratedRecipe } from "@/types/recipe";
import { GeminiApiError, logGeminiError, toGeminiApiError } from "./errors";
import { normalizeGeneratedRecipe } from "./normalize-generated-recipe";
import { generateRecipeWithGeminiSdk } from "./recipe-sdk";

function cuisineLabel(cuisine: Cuisine): string {
  return cuisine === "sri-lankan"
    ? "Sri Lankan"
    : cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
}

function buildRecipeSystemInstruction(cuisine: Cuisine): string {
  const label = cuisineLabel(cuisine);
  const cuisineId = appCuisineToDbId(cuisine);
  const isSriLankan = cuisine === "sri-lankan";

  const namingRules = isSriLankan
    ? `
NAMING (Sri Lankan — required):
- dish_name MUST be Tanglish: Tamil pronunciation written in English letters only (NOT Tamil Unicode).
- Do NOT use Tamil script characters (e.g. no இடியாப்பம், no மீன் குழம்பு).
- Use authentic Sri Lankan Tamil dish names in Roman letters.

Examples (English menu → dish_name):
- "String Hoppers" → "Idiyappam"
- "Fish Curry" → "Meen Kulambu"
- "Coconut Roti" → "Pol Roti"
- "Chicken Curry" → "Kozhi Kulambu"

- description: 1-2 sentences; Tanglish or Tamil-English mix is OK
- step titles/instructions: Tanglish or Tamil-English mix; avoid Tamil Unicode in dish_name only
- dish_slug optional (lowercase hyphenated, e.g. "meen-kulambu"); omit if dish_name is already Roman letters`
    : `
NAMING:
- dish_name in standard English
- dish_slug optional (lowercase English hyphenated name)`;

  return `You are Chefie, the AI Recipe Generator for the Chefie cooking app.

CORE MISSION:
1. Create exactly ONE practical ${label} home-cooking recipe using the user's available ingredients.
2. Prefer the listed ingredients; you may add small pantry staples (salt, oil, water) when needed.
3. Steps must be clear, ordered, and realistic for home cooks.
${namingRules}

OUTPUT RULES:
- Respond with ONLY valid JSON. No markdown, no code fences, no commentary.
- Use this exact shape:
{
  "dish_name": "string",
  "dish_slug": "string (optional; lowercase hyphenated id)",
  "description": "string (1-2 sentences)",
  "cuisine_id": "${cuisineId}",
  "meal_type": "Breakfast" | "Lunch" | "Dinner",
  "dish_type": "Veg" | "Non-Veg",
  "image_url": "string (valid https food photo URL)",
  "prep_time": number (minutes),
  "cooking_time": number (minutes),
  "ingredients": [
    {
      "ingredient_name": "string (e.g. Chicken thigh)",
      "quantity": number (e.g. 300),
      "unit": "string (e.g. g, cups, tbsp) or null",
      "display_text": "string (e.g. 300g boneless chicken thighs)"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "short step title",
      "instruction": "detailed instruction",
      "break_time_minutes": 0,
      "timer_required": false,
      "timer_minutes": null
    }
  ]
}

RULES:
- meal_type must be one of: Breakfast, Lunch, Dinner
- dish_type must be Veg or Non-Veg based on ingredients
- timer_required is true only when timer_minutes is set
- break_time_minutes is rest time before the next step (0 if none)
- Every ingredient MUST include ingredient_name, quantity, unit (when applicable), and display_text
- display_text is what home cooks see on a recipe card (combine amount + unit + name naturally)`;
}

export async function generateRecipeWithGemini(
  ingredients: string,
  cuisine: Cuisine,
): Promise<GeneratedRecipe> {
  const systemInstruction = buildRecipeSystemInstruction(cuisine);
  const userPrompt = `Available ingredients: ${ingredients}

Generate the recipe JSON now.`;

  try {
    const { text } = await generateRecipeWithGeminiSdk({
      systemInstruction,
      userPrompt,
      json: true,
      temperature: 0.7,
    });

    if (!text.trim()) {
      throw new GeminiApiError({
        code: "PARSE_ERROR",
        title: "No recipe returned",
        userMessage:
          "The AI didn't return a recipe. Please try again with a few more ingredient details.",
        statusCode: 502,
        retryable: true,
      });
    }

    const parsed = JSON.parse(text) as unknown;
    const recipe = normalizeGeneratedRecipe(parsed, cuisine);
    return {
      ...recipe,
      cuisine,
      cuisine_id: appCuisineToDbId(cuisine),
    };
  } catch (error) {
    logGeminiError("generateRecipeWithGemini", error);

    if (error instanceof GeminiApiError) throw error;

    if (error instanceof SyntaxError) {
      throw new GeminiApiError({
        code: "PARSE_ERROR",
        title: "Unexpected AI response",
        userMessage:
          "The AI returned an invalid recipe format. Please try generating again.",
        statusCode: 502,
        retryable: true,
        cause: error,
      });
    }

    throw toGeminiApiError(error);
  }
}
