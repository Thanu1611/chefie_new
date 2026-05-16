import { resolveDishIngredients } from "@/lib/dishes/dish-ingredients";
import type { DishWithSteps } from "@/types/dish";

export function buildDishVoiceContext(
  dish: DishWithSteps,
  ingredientDisplayLines?: string[],
): string {
  const ingredients =
    ingredientDisplayLines ??
    resolveDishIngredients(dish).map((line) =>
      typeof line === "string" ? line : String(line),
    );
  const sortedSteps = [...dish.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  const lines: string[] = [
    "You are Chefie, a voice cooking assistant.",
    "The user is cooking ONLY the dish below. Do not give general cooking advice unless it directly helps this recipe.",
    "Do not suggest other dishes or unrelated techniques.",
    "",
    `DISH: ${dish.dishName}`,
    `CUISINE: ${dish.cuisine?.cuisineName ?? dish.cuisineId}`,
    `MEAL: ${dish.mealType}`,
    `TYPE: ${dish.dishType}`,
    `DESCRIPTION: ${dish.description}`,
    `PREP TIME: ${dish.prepTime} minutes`,
    `COOK TIME: ${dish.cookingTime} minutes`,
    "",
    "INGREDIENTS:",
    ...(ingredients.length > 0
      ? ingredients.map((i) => `- ${i}`)
      : ["- See description and steps below"]),
    "",
    "COOKING STEPS:",
  ];

  for (const step of sortedSteps) {
    let line = `${step.stepNumber}. ${step.title}: ${step.instruction}`;
    if (step.timerRequired && step.timerMinutes != null) {
      line += ` [TIMER: ${step.timerMinutes} minutes]`;
    }
    if (step.breakTimeMinutes > 0) {
      line += ` [BREAK BEFORE NEXT STEP: ${step.breakTimeMinutes} minutes]`;
    }
    lines.push(line);
  }

  lines.push(
    "",
    "RULES:",
    "- Answer only about this dish: substitutions, timing, technique, and mistakes for these steps.",
    "- Reference step numbers when guiding the user.",
    "- If asked about another recipe, politely redirect to this dish.",
  );

  return lines.join("\n");
}
