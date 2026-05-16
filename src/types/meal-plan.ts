import type { DishType, MealType } from "@/types/dish";

export interface MealPlanEntry {
  planId: number;
  planDate: string;
  mealType: MealType;
  dishId: string;
  servings: number;
  baseServings: number;
  createdAt: string;
  dishName: string;
  description: string;
  dishType: DishType;
  cuisineId: string;
  cuisineName: string;
  imageUrl: string;
  prepTime: number;
  cookingTime: number;
}

export interface DishSearchResult {
  dishId: string;
  dishName: string;
  description: string;
  mealType: MealType;
  dishType: DishType;
  cuisineId: string;
  cuisineName: string;
  imageUrl: string;
  prepTime: number;
  cookingTime: number;
  baseServings: number;
}

export interface ShoppingListItem {
  id: number;
  planDate: string;
  ingredientName: string;
  quantity: string;
  purchased: boolean;
  createdAt: string;
}

export interface GeneratedShoppingLine {
  ingredientName: string;
  quantity: string;
}

export type PlanAddStatus = "empty" | "all_added" | "partial" | "none_added";

export interface PlanAddStatusResult {
  status: PlanAddStatus;
  totalPlans: number;
  addedPlans: number;
  newPlans: number;
  message: string;
}
