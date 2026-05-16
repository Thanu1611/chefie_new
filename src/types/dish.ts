export type MealType = "Breakfast" | "Lunch" | "Dinner";
export type DishType = "Veg" | "Non-Veg";

export interface Cuisine {
  cuisineId: string;
  cuisineName: string;
  imageUrl: string;
  shortDescription: string;
}

export interface Dish {
  dishId: string;
  cuisineId: string;
  dishName: string;
  description: string;
  mealType: MealType;
  dishType: DishType;
  imageUrl: string;
  prepTime: number;
  cookingTime: number;
  baseServings?: number;
  ingredients?: string[];
  cuisine?: Cuisine;
}

export interface DishStep {
  stepId: number;
  dishId: string;
  stepNumber: number;
  title: string;
  instruction: string;
  breakTimeMinutes: number;
  timerRequired: boolean;
  timerMinutes: number | null;
}

export interface DishWithSteps extends Dish {
  steps: DishStep[];
}
