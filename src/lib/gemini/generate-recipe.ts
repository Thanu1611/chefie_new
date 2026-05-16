import type { Cuisine, GeneratedRecipe } from "@/types/recipe";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function generateRecipeWithGemini(
  ingredients: string,
  cuisine: Cuisine,
): Promise<GeneratedRecipe> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const cuisineLabel =
    cuisine === "sri-lankan"
      ? "Sri Lankan"
      : cuisine.charAt(0).toUpperCase() + cuisine.slice(1);

  const prompt = `You are Chefie, a cooking assistant. Create one ${cuisineLabel} recipe using these available ingredients: ${ingredients}.

Respond with ONLY valid JSON (no markdown) in this exact shape:
{
  "name": "string",
  "cuisine": "${cuisine}",
  "cookingTimeMinutes": number,
  "difficulty": "easy" | "medium" | "hard",
  "ingredients": [{"name": "string", "amount": "string"}],
  "steps": [{"order": 1, "instruction": "string", "timerMinutes": number or omit}]
}`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No recipe generated.");
  }

  const parsed = JSON.parse(text) as GeneratedRecipe;
  return {
    ...parsed,
    cuisine,
  };
}
