import type { GeneratedIngredient } from "@/types/recipe";

/** Parse legacy or loose amount strings into quantity + unit. */
export function parseAmountString(amount: string): {
  quantity: number | null;
  unit: string | null;
} {
  const trimmed = amount.trim();
  if (!trimmed) return { quantity: null, unit: null };

  const match = trimmed.match(
    /^([\d]+(?:[./][\d]+)?)\s*([a-zA-Z][a-zA-Z\s-]*)?$/,
  );
  if (!match) return { quantity: null, unit: null };

  const rawQty = match[1].replace(",", ".");
  let quantity: number | null = null;
  if (rawQty.includes("/")) {
    const [a, b] = rawQty.split("/").map(Number);
    quantity = b ? a / b : a;
  } else {
    quantity = Number(rawQty);
  }
  if (!Number.isFinite(quantity)) quantity = null;

  const unit = match[2]?.trim().toLowerCase() || null;
  return { quantity, unit };
}

export function buildDisplayText(
  ingredientName: string,
  quantity: number | null,
  unit: string | null,
  fallbackAmount?: string,
): string {
  const name = ingredientName.trim();
  if (fallbackAmount?.trim()) {
    const combined = `${fallbackAmount.trim()} ${name}`.trim();
    return combined;
  }
  if (quantity == null) return name;
  const qty =
    Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 100) / 100);
  if (!unit) return `${qty} ${name}`;
  return `${qty} ${unit} ${name}`;
}

export function normalizeGeneratedIngredient(raw: unknown): GeneratedIngredient | null {
  if (typeof raw === "string") {
    const name = raw.trim();
    if (!name) return null;
    return {
      ingredient_name: name,
      quantity: null,
      unit: null,
      display_text: name,
    };
  }

  const ing = raw as Record<string, unknown>;
  const ingredientName = String(
    ing.ingredient_name ?? ing.name ?? "",
  ).trim();
  if (!ingredientName) return null;

  let quantity: number | null = null;
  const qtyRaw = ing.quantity ?? ing.qty;
  if (qtyRaw != null && qtyRaw !== "") {
    const n = Number(qtyRaw);
    quantity = Number.isFinite(n) ? n : null;
  }

  let unit =
    typeof ing.unit === "string" && ing.unit.trim() ? ing.unit.trim() : null;

  const legacyAmount = String(ing.amount ?? "").trim();
  if (quantity == null && !unit && legacyAmount) {
    const parsed = parseAmountString(legacyAmount);
    quantity = parsed.quantity;
    unit = parsed.unit;
  }

  const displayText = String(ing.display_text ?? "").trim();
  const display_text =
    displayText ||
    buildDisplayText(ingredientName, quantity, unit, legacyAmount || undefined);

  return {
    ingredient_name: ingredientName,
    quantity,
    unit,
    display_text,
  };
}

export function normalizeGeneratedIngredients(raw: unknown): GeneratedIngredient[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeGeneratedIngredient(item))
    .filter((i): i is GeneratedIngredient => i != null);
}
