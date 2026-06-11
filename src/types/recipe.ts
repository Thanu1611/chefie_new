import type { DishType, MealType } from "@/types/dish";

export type Cuisine = "chinese" | "indian" | "sri-lankan";

export type Difficulty = "easy" | "medium" | "hard";

export type SpicyLevel = 0 | 1 | 2 | 3;

export interface Ingredient {
  name: string;
  amount: string;
}

/** Structured ingredient from Gemini / dish_ingredients table. */
export interface GeneratedIngredient {
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  display_text: string;
}

export interface CookingStep {
  order: number;
  instruction: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: Cuisine;
  image: string;
  description?: string;
  cookingTimeMinutes: number;
  difficulty: Difficulty;
  servings: number;
  isVegetarian: boolean;
  spicyLevel: SpicyLevel;
  ingredients: Ingredient[];
  steps: CookingStep[];
}

export interface SavedRecipe {
  id: string;
  recipeId: string;
  savedAt: string;
  recipe?: Recipe;
}

export interface RecipeFilters {
  cuisine?: Cuisine;
  search?: string;
  vegetarian?: boolean | null;
  nonVegetarian?: boolean | null;
  spicyLevel?: SpicyLevel | null;
  maxCookingTime?: number | null;
}

export interface GeneratedDishStep {
  step_number: number;
  title: string;
  instruction: string;
  break_time_minutes: number;
  timer_required: boolean;
  timer_minutes: number | null;
}

/** Structured recipe from Gemini for display and optional DB insert. */
export interface GeneratedRecipe {
  dish_name: string;
  /** Optional slug for dish_id (auto-derived from Tanglish dish_name when omitted). */
  dish_slug?: string;
  description: string;
  cuisine_id: string;
  meal_type: MealType;
  dish_type: DishType;
  image_url: string;
  prep_time: number;
  cooking_time: number;
  ingredients: GeneratedIngredient[];
  steps: GeneratedDishStep[];
  difficulty?: Difficulty;
  /** UI cuisine chip (derived from selected cuisine). */
  cuisine: Cuisine;
  /** English food-photo label (for AI image + web search when dish_name is Tamil). */
  image_subject_en?: string;
  /** True when image_url is a fresh Gemini/Imagen render for this recipe. */
  image_ai_generated?: boolean;
  /** True when image_url came from an online photo search matched to the recipe. */
  image_matched_online?: boolean;
}
