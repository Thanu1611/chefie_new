import type { DishIngredient, ScaledIngredient } from "@/types/dish-ingredient";

export function getScaleFactor(
  selectedServings: number,
  baseServings: number,
): number {
  const base = baseServings > 0 ? baseServings : 1;
  const selected = selectedServings > 0 ? selectedServings : base;
  return selected / base;
}

/** Scale recipe times with servings (rounded, minimum 1 minute). */
export function scaleMinutes(baseMinutes: number, scaleFactor: number): number {
  if (baseMinutes <= 0) return 0;
  if (scaleFactor <= 1) return baseMinutes;
  return Math.max(1, Math.round(baseMinutes * scaleFactor));
}

export function formatQuantityValue(quantity: number): string {
  if (Number.isInteger(quantity)) return String(quantity);
  const rounded = Math.round(quantity * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export function formatIngredientDisplay(
  ingredientName: string,
  quantity: number,
  unit: string | null,
): string {
  const qty = formatQuantityValue(quantity);
  if (!unit) return `${qty} ${ingredientName}`;
  return `${qty} ${unit} ${ingredientName}`;
}

export function scaleIngredient(
  ingredient: DishIngredient,
  scaleFactor: number,
): ScaledIngredient {
  if (ingredient.quantity == null || scaleFactor === 1) {
    if (scaleFactor === 1 || ingredient.quantity != null) {
      return {
        ingredientName: ingredient.ingredientName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        displayText: ingredient.displayText,
      };
    }
    return {
      ingredientName: ingredient.ingredientName,
      quantity: null,
      unit: ingredient.unit,
      displayText: `${ingredient.displayText} (×${formatQuantityValue(scaleFactor)})`,
    };
  }

  const scaledQty = ingredient.quantity * scaleFactor;
  return {
    ingredientName: ingredient.ingredientName,
    quantity: scaledQty,
    unit: ingredient.unit,
    displayText: formatIngredientDisplay(
      ingredient.ingredientName,
      scaledQty,
      ingredient.unit,
    ),
  };
}

export function scaleIngredients(
  ingredients: DishIngredient[],
  scaleFactor: number,
): ScaledIngredient[] {
  return ingredients.map((ing) => scaleIngredient(ing, scaleFactor));
}

export function ingredientMergeKey(
  ingredientName: string,
  unit: string | null,
): string {
  const name = ingredientName.trim().toLowerCase();
  const u = (unit ?? "").trim().toLowerCase();
  return `${name}::${u}`;
}
