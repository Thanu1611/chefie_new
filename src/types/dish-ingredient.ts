export interface DishIngredient {
  id?: number;
  dishId?: string;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  displayText: string;
}

export interface ScaledIngredient {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  displayText: string;
}
