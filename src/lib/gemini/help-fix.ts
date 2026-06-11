import { GEMINI_TAMIL_INSTRUCTION } from "@/lib/i18n/language";
import { generateWithGemini, getGeminiApiKey } from "./client";
import { logGeminiError } from "./errors";

const QUICK_FIXES: Record<string, string> = {
  "too-salty": "Dish tastes too salty",
  "too-spicy": "Dish is too spicy",
  "burnt-food": "Food got burnt while cooking",
  "watery-curry": "Curry is too watery or thin",
  "missing-ingredient": "I'm missing a key ingredient",
};

export function getHelpTopicLabel(topic: string): string {
  return QUICK_FIXES[topic] ?? topic;
}

export async function getDishCookingHelp(
  question: string,
  dishContext: string,
): Promise<string> {
  if (!getGeminiApiKey()) {
    return `For this dish only:\n• Re-read the step in the recipe context\n• ${question}\n• Adjust heat and timing gradually\n• Taste before moving to the next step`;
  }

  const prompt = `You are Chefie, a friendly cooking assistant.

${dishContext}

The user asks: "${question}"

Give a concise, practical answer in 3-5 short bullet points. Only help with THIS dish. No other recipes. No intro fluff.

${GEMINI_TAMIL_INSTRUCTION}`;

  try {
    const { text } = await generateWithGemini({ prompt, temperature: 0.4 });
    if (text.trim()) return text.trim();
  } catch (error) {
    logGeminiError("getDishCookingHelp", error);
  }

  return `For this dish only:\n• Check the step that matches your question\n• ${question}\n• Adjust seasoning and heat slowly\n• Use the timers listed in the recipe steps`;
}

export async function getCookingFix(topic: string): Promise<string> {
  const label = getHelpTopicLabel(topic);

  if (!getGeminiApiKey()) {
    return getStaticFix(topic);
  }

  const prompt = `You are Chefie, a friendly cooking assistant. The user has this problem: "${label}".

Give a concise, practical fix in 3-5 short bullet points. Be specific and actionable. No intro fluff.

${GEMINI_TAMIL_INSTRUCTION}`;

  try {
    const { text } = await generateWithGemini({ prompt, temperature: 0.5 });
    if (text.trim()) return text.trim();
  } catch (error) {
    logGeminiError("getCookingFix", error);
  }

  return getStaticFix(topic);
}

function getStaticFix(topic: string): string {
  const fixes: Record<string, string> = {
    "too-salty":
      "• Add acid: squeeze lemon or splash vinegar\n• Dilute with unsalted broth or water\n• Balance with cream, coconut milk, or potatoes\n• Serve with plain rice or bread to offset salt",
    "too-spicy":
      "• Stir in dairy: yogurt, cream, or coconut milk\n• Add sweetness: honey, sugar, or grated carrot\n• Increase volume with more base (tomatoes, broth)\n• Serve with cooling raita or cucumber salad",
    "burnt-food":
      "• Do not scrape burnt bits into the dish — transfer top layer to a new pan\n• Mask smoke flavor with fresh herbs and citrus\n• Add liquid and simmer gently\n• Next time: lower heat and use a heavy-bottomed pot",
    "watery-curry":
      "• Simmer uncovered to reduce liquid\n• Mash a few lentils or potatoes into the sauce\n• Stir in tomato paste or ground cashews\n• Finish with a cornstarch slurry (1 tsp starch + 2 tbsp water)",
    "missing-ingredient":
      "• Check pantry substitutes: yogurt for cream, vinegar + milk for buttermilk\n• Skip garnishes first — core flavor usually survives\n• Search Chefie's generator for a recipe using what you have\n• Ask voice assistant for cuisine-specific swaps",
  };
  return (
    fixes[topic] ??
    "• Taste and adjust seasoning\n• Add fat (butter/oil) for richness\n• Rest the dish 5 minutes before serving\n• Ask Chefie voice assistant for personalized help"
  );
}
