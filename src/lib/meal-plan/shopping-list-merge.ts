export function normalizeIngredientKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Parse dish-count style quantities like "×3 dishes" or "1 dish". */
export function parseDishCountQuantity(quantity: string): number {
  const trimmed = quantity.trim();
  const match = trimmed.match(/×\s*(\d+)\s*dishes?/i);
  if (match) return Number(match[1]) || 0;
  if (/1\s*dish/i.test(trimmed)) return 1;
  const num = Number.parseInt(trimmed, 10);
  return Number.isFinite(num) && num > 0 ? num : 1;
}

export function formatDishCountQuantity(count: number): string {
  if (count <= 1) return "1 dish";
  return `×${count} dishes`;
}

/** Merge two quantity strings by summing dish counts when possible. */
export function mergeQuantityText(a: string, b: string): string {
  const aTrim = a.trim();
  const bTrim = b.trim();
  if (!aTrim) return bTrim;
  if (!bTrim) return aTrim;

  const aCount = parseDishCountQuantity(aTrim);
  const bCount = parseDishCountQuantity(bTrim);
  const combined = aCount + bCount;

  if (/dish/i.test(aTrim) || /dish/i.test(bTrim)) {
    return formatDishCountQuantity(combined);
  }

  if (aTrim === bTrim) return aTrim;
  return `${aTrim}, ${bTrim}`;
}

export interface ShoppingListLine {
  ingredientName: string;
  quantity: string;
}

import {
  formatIngredientDisplay,
  formatQuantityValue,
  ingredientMergeKey,
} from "@/lib/dishes/ingredient-scaling";

export interface NumericIngredientLine {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
}

/** Merge by ingredient name + unit, summing numeric quantities. */
export function mergeNumericIngredientLines(
  lines: NumericIngredientLine[],
): ShoppingListLine[] {
  const map = new Map<
    string,
    { display: string; unit: string | null; total: number }
  >();

  for (const line of lines) {
    const key = ingredientMergeKey(line.ingredientName, line.unit);
    if (!line.ingredientName.trim()) continue;

    const add = line.quantity ?? 1;
    const existing = map.get(key);
    if (existing) {
      existing.total += add;
    } else {
      map.set(key, {
        display: line.ingredientName.trim(),
        unit: line.unit,
        total: add,
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => a.display.localeCompare(b.display))
    .map(({ display, unit, total }) => ({
      ingredientName: display,
      quantity:
        unit != null && unit !== ""
          ? formatIngredientDisplay(display, total, unit)
          : `${formatQuantityValue(total)} ${display}`,
    }));
}

export function mergeShoppingLines(
  lines: ShoppingListLine[],
): ShoppingListLine[] {
  const map = new Map<
    string,
    { display: string; quantity: string }
  >();

  for (const line of lines) {
    const key = normalizeIngredientKey(line.ingredientName);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.quantity = mergeQuantityText(existing.quantity, line.quantity);
    } else {
      map.set(key, {
        display: line.ingredientName.trim(),
        quantity: line.quantity.trim() || "1 dish",
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => a.display.localeCompare(b.display))
    .map(({ display, quantity }) => ({
      ingredientName: display,
      quantity,
    }));
}
