export type Cuisine = "chinese" | "indian" | "sri-lankan";

export type Difficulty = "easy" | "medium" | "hard";

export type SpicyLevel = 0 | 1 | 2 | 3;

export interface Ingredient {
  name: string;
  amount: string;
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

export interface GeneratedRecipe {
  name: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  cookingTimeMinutes: number;
  difficulty: Difficulty;
  cuisine: Cuisine;
}
