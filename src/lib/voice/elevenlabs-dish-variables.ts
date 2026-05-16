import { resolveDishIngredients } from "@/lib/dishes/dish-ingredients";
import type { DishWithSteps } from "@/types/dish";

/** Dynamic variables for ElevenLabs ConvAI agent (matches agent dashboard fields). */
export function buildElevenLabsDishDynamicVariables(
  dish: DishWithSteps,
): Record<string, string> {
  const sortedSteps = [...dish.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  const ingredients = resolveDishIngredients(dish);
  const ingredientsText = ingredients.map((item) => `- ${item}`).join("\n");

  const stepsText = sortedSteps
    .map(
      (step) =>
        `Step ${step.stepNumber}: ${step.title} — ${step.instruction}`,
    )
    .join("\n");

  const timerLines: string[] = [];
  for (const step of sortedSteps) {
    if (step.timerRequired && step.timerMinutes != null) {
      timerLines.push(
        `Step ${step.stepNumber} (${step.title}): cook for ${step.timerMinutes} minutes`,
      );
    }
    if (step.breakTimeMinutes > 0) {
      timerLines.push(
        `After step ${step.stepNumber}: wait ${step.breakTimeMinutes} minutes before step ${step.stepNumber + 1}`,
      );
    }
  }
  const timersText =
    timerLines.length > 0
      ? timerLines.join("\n")
      : "No timers or break periods required for this dish.";

  return {
    dish_id: dish.dishId,
    dish_name: dish.dishName,
    cuisine_name: dish.cuisine?.cuisineName ?? dish.cuisineId,
    dish_description: dish.description,
    prep_time: String(dish.prepTime),
    cooking_time: String(dish.cookingTime),
    meal_type: dish.mealType,
    dish_type: dish.dishType,
    ingredients: ingredientsText,
    cooking_steps: stepsText,
    timers_and_breaks: timersText,
  };
}
