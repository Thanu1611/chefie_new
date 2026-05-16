import { normalizeGeneratedIngredients } from "@/lib/dishes/generated-ingredient";
import { appCuisineToDbId } from "@/lib/dishes/cuisine-map";
import { sanitizeRemoteImageUrl } from "@/lib/images/remote-image";
import type { DishType, MealType } from "@/types/dish";
import type { Cuisine, GeneratedDishStep, GeneratedRecipe } from "@/types/recipe";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
const DISH_TYPES: DishType[] = ["Veg", "Non-Veg"];
const TAMIL_UNICODE = /[\u0B80-\u0BFF]/;

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Sri Lankan dish_name must be Tanglish (Roman letters), not Tamil Unicode. */
function fixSriLankanDishName(
  dishName: string,
  dishSlug?: string,
): { dishName: string; dishSlug?: string } {
  const slug =
    dishSlug?.trim() ||
    dishName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (!TAMIL_UNICODE.test(dishName)) {
    return { dishName, dishSlug: slug || undefined };
  }

  if (dishSlug && !TAMIL_UNICODE.test(dishSlug)) {
    return { dishName: titleCaseFromSlug(dishSlug), dishSlug };
  }

  return {
    dishName: "Sri Lankan Special",
    dishSlug: slug || `sri-lankan-special-${Date.now()}`,
  };
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseMealType(value: unknown): MealType {
  const s = asString(value, "Lunch");
  const match = MEAL_TYPES.find((m) => m.toLowerCase() === s.toLowerCase());
  return match ?? "Lunch";
}

function parseDishType(value: unknown, ingredientsText: string): DishType {
  const s = asString(value);
  const match = DISH_TYPES.find((d) => d.toLowerCase() === s.toLowerCase());
  if (match) return match;
  const lower = ingredientsText.toLowerCase();
  const nonVegHints = [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "fish",
    "shrimp",
    "egg",
    "mutton",
    "turkey",
    "bacon",
  ];
  if (nonVegHints.some((h) => lower.includes(h))) return "Non-Veg";
  return "Veg";
}

function normalizeSteps(raw: unknown): GeneratedDishStep[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => {
    const step = item as Record<string, unknown>;
    const stepNumber = asNumber(
      step.step_number ?? step.stepNumber ?? step.order,
      index + 1,
    );
    const instruction = asString(
      step.instruction,
      asString(step.title, `Step ${stepNumber}`),
    );
    const title =
      asString(step.title) ||
      instruction.slice(0, 48) + (instruction.length > 48 ? "…" : "");
    const timerMinutesRaw = step.timer_minutes ?? step.timerMinutes;
    const timerMinutes =
      timerMinutesRaw == null || timerMinutesRaw === ""
        ? null
        : asNumber(timerMinutesRaw, 0);

    return {
      step_number: stepNumber,
      title: title || `Step ${stepNumber}`,
      instruction,
      break_time_minutes: asNumber(
        step.break_time_minutes ?? step.breakTimeMinutes,
        0,
      ),
      timer_required: Boolean(
        step.timer_required ??
          step.timerRequired ??
          (timerMinutes != null && timerMinutes > 0),
      ),
      timer_minutes: timerMinutes,
    };
  });
}


/** Normalize Gemini JSON (snake_case or legacy camelCase) into GeneratedRecipe. */
export function normalizeGeneratedRecipe(
  raw: unknown,
  selectedCuisine: Cuisine,
): GeneratedRecipe {
  const r = (raw ?? {}) as Record<string, unknown>;
  const ingredients = normalizeGeneratedIngredients(r.ingredients);
  const ingredientsText = ingredients.map((i) => i.display_text).join(" ");

  let dishName = asString(r.dish_name ?? r.name, "Untitled Recipe");
  let dishSlug = asString(r.dish_slug ?? r.dishSlug) || undefined;

  if (selectedCuisine === "sri-lankan") {
    const fixed = fixSriLankanDishName(dishName, dishSlug);
    dishName = fixed.dishName;
    dishSlug = fixed.dishSlug;
  }
  const cookingTime = asNumber(
    r.cooking_time ?? r.cookingTimeMinutes,
    30,
  );
  const prepTime = asNumber(r.prep_time ?? r.prepTime, Math.max(5, Math.round(cookingTime * 0.3)));

  return {
    dish_name: dishName,
    ...(dishSlug ? { dish_slug: dishSlug } : {}),
    description: asString(
      r.description,
      `A ${parseMealType(r.meal_type ?? r.mealType).toLowerCase()} recipe using your ingredients.`,
    ),
    cuisine_id: asString(r.cuisine_id) || appCuisineToDbId(selectedCuisine),
    cuisine: selectedCuisine,
    meal_type: parseMealType(r.meal_type ?? r.mealType),
    dish_type: parseDishType(r.dish_type ?? r.dishType, ingredientsText),
    image_url: sanitizeRemoteImageUrl(
      asString(r.image_url ?? r.imageUrl, ""),
    ),
    prep_time: prepTime,
    cooking_time: cookingTime,
    ingredients,
    steps: normalizeSteps(r.steps),
    difficulty:
      r.difficulty === "easy" ||
      r.difficulty === "medium" ||
      r.difficulty === "hard"
        ? r.difficulty
        : undefined,
  };
}
