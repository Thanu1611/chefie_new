function slugPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * `${cuisine_id}-${meal_type}-${dish_type}-${slug}`
 * Use dishSlug (English transliteration) when dish_name is Tamil/non-Latin.
 */
export function buildDishId(
  cuisineId: string,
  mealType: string,
  dishType: string,
  dishName: string,
  dishSlug?: string,
): string {
  const slugSource = dishSlug?.trim() || dishName;
  const parts = [cuisineId, mealType, dishType, slugSource]
    .map(slugPart)
    .filter(Boolean);

  if (parts.length >= 4) {
    return parts.join("-");
  }

  return `${cuisineId}-${slugPart(mealType)}-${slugPart(dishType)}-${Date.now()}`;
}
