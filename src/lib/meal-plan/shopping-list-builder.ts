import { getScaleFactor, scaleIngredient } from "@/lib/dishes/ingredient-scaling";
import { getDishIngredientsByDishId } from "@/lib/dishes/get-dish-ingredients";
import {
  mergeNumericIngredientLines,
  type NumericIngredientLine,
} from "@/lib/meal-plan/shopping-list-merge";
import type { MealPlanEntry } from "@/types/meal-plan";
import type { ShoppingListLine } from "@/lib/meal-plan/shopping-list-merge";

export async function buildShoppingListFromPlans(
  plans: MealPlanEntry[],
): Promise<ShoppingListLine[]> {
  const numericLines: NumericIngredientLine[] = [];

  for (const plan of plans) {
    const ingredients = await getDishIngredientsByDishId(plan.dishId, plan.dishName);
    const baseServings = plan.baseServings > 0 ? plan.baseServings : 2;
    const servings = plan.servings > 0 ? plan.servings : baseServings;
    const scaleFactor = getScaleFactor(servings, baseServings);

    for (const ing of ingredients) {
      const scaled = scaleIngredient(ing, scaleFactor);
      numericLines.push({
        ingredientName: scaled.ingredientName,
        quantity: scaled.quantity,
        unit: scaled.unit,
      });
    }
  }

  return mergeNumericIngredientLines(numericLines);
}

export async function getScaledIngredientsForPlan(
  plan: MealPlanEntry,
): Promise<NumericIngredientLine[]> {
  const ingredients = await getDishIngredientsByDishId(plan.dishId, plan.dishName);
  const baseServings = plan.baseServings > 0 ? plan.baseServings : 2;
  const servings = plan.servings > 0 ? plan.servings : baseServings;
  const scaleFactor = getScaleFactor(servings, baseServings);

  return ingredients.map((ing) => {
    const scaled = scaleIngredient(ing, scaleFactor);
    return {
      ingredientName: scaled.ingredientName,
      quantity: scaled.quantity,
      unit: scaled.unit,
    };
  });
}
