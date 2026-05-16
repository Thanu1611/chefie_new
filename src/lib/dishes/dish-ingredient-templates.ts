import type { DishIngredient } from "@/types/dish-ingredient";
import { getDishIngredients } from "@/lib/dishes/dish-ingredients";

type TemplateRow = {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
};

const DETAILED_TEMPLATES: Record<string, TemplateRow[]> = {
  "Congee with Greens": [
    { ingredientName: "jasmine rice", quantity: 1, unit: "cup" },
    { ingredientName: "chicken or vegetable broth", quantity: 4, unit: "cups" },
    { ingredientName: "bok choy", quantity: 1, unit: "bunch" },
    { ingredientName: "fresh ginger", quantity: 1, unit: "tbsp" },
    { ingredientName: "soy sauce", quantity: 2, unit: "tbsp" },
    { ingredientName: "white pepper", quantity: 0.5, unit: "tsp" },
    { ingredientName: "sesame oil", quantity: 1, unit: "tsp" },
  ],
  "Chicken Congee": [
    { ingredientName: "jasmine rice", quantity: 1, unit: "cup" },
    { ingredientName: "chicken breast", quantity: 12, unit: "oz" },
    { ingredientName: "ginger", quantity: 1, unit: "tbsp" },
    { ingredientName: "spring onion", quantity: 2, unit: "stalks" },
    { ingredientName: "broth", quantity: 4, unit: "cups" },
    { ingredientName: "white pepper", quantity: 0.5, unit: "tsp" },
  ],
  "Vegetable Fried Rice": [
    { ingredientName: "day-old rice", quantity: 3, unit: "cups" },
    { ingredientName: "peas", quantity: 1, unit: "cup" },
    { ingredientName: "carrots", quantity: 1, unit: "cup" },
    { ingredientName: "soy sauce", quantity: 3, unit: "tbsp" },
    { ingredientName: "sesame oil", quantity: 1, unit: "tbsp" },
  ],
  "Kung Pao Chicken": [
    { ingredientName: "chicken thigh", quantity: 1, unit: "lb" },
    { ingredientName: "peanuts", quantity: 0.5, unit: "cup" },
    { ingredientName: "dried chilies", quantity: 8, unit: null },
    { ingredientName: "Sichuan pepper", quantity: 1, unit: "tsp" },
    { ingredientName: "soy sauce", quantity: 3, unit: "tbsp" },
    { ingredientName: "rice vinegar", quantity: 2, unit: "tbsp" },
  ],
};

function rowToIngredient(row: TemplateRow): DishIngredient {
  const displayText =
    row.quantity != null && row.unit
      ? `${formatQty(row.quantity)} ${row.unit} ${row.ingredientName}`
      : row.quantity != null
        ? `${formatQty(row.quantity)} ${row.ingredientName}`
        : row.ingredientName;

  return {
    ingredientName: row.ingredientName,
    quantity: row.quantity,
    unit: row.unit,
    displayText,
  };
}

function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

function fallbackFromNames(dishName: string): DishIngredient[] {
  return getDishIngredients(dishName).map((name) => ({
    ingredientName: name,
    quantity: 1,
    unit: "portion",
    displayText: name,
  }));
}

export function getTemplateIngredients(dishName: string): DishIngredient[] {
  const detailed = DETAILED_TEMPLATES[dishName];
  if (detailed) return detailed.map(rowToIngredient);
  return fallbackFromNames(dishName);
}
