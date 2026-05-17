import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealPlanEntry, ShoppingListItem } from "@/types/meal-plan";
import type { DishType, MealType } from "@/types/dish";
import { getMealPlanAuthContext } from "./meal-plan-auth";
import { getSupabaseAdmin } from "./server";

const DISH_EMBED =
  "dish_id, dish_name, description, meal_type, dish_type, cuisine_id, image_url, prep_time, cooking_time";

type DishEmbed = {
  dish_id: string;
  dish_name: string;
  description: string;
  meal_type: string;
  dish_type: string;
  cuisine_id: string;
  image_url: string;
  prep_time: number;
  cooking_time: number;
};

type MealPlanRow = {
  plan_id: number;
  plan_date: string;
  meal_type: string;
  dish_id: string;
  created_at: string;
  dishes: DishEmbed | DishEmbed[] | null;
};

async function loadCuisineNameMap(supabase: SupabaseClient, cuisineIds: string[]) {
  const map = new Map<string, string>();
  const unique = [...new Set(cuisineIds.filter(Boolean))];
  if (!unique.length) return map;
  const { data } = await supabase.from("cuisines").select("cuisine_id, cuisine_name").in("cuisine_id", unique);
  for (const row of data ?? []) map.set(row.cuisine_id, row.cuisine_name);
  return map;
}

function mapPlanRow(row: MealPlanRow, cuisineMap: Map<string, string>): MealPlanEntry | null {
  const dish = Array.isArray(row.dishes) ? row.dishes[0] : row.dishes;
  if (!dish) return null;
  return {
    planId: row.plan_id,
    planDate: row.plan_date,
    mealType: row.meal_type as MealType,
    dishId: row.dish_id,
    servings: 2,
    baseServings: 2,
    createdAt: row.created_at,
    dishName: dish.dish_name,
    description: dish.description,
    dishType: dish.dish_type as DishType,
    cuisineId: dish.cuisine_id,
    cuisineName: cuisineMap.get(dish.cuisine_id) ?? dish.cuisine_id,
    imageUrl: dish.image_url,
    prepTime: dish.prep_time,
    cookingTime: dish.cooking_time,
  };
}

export async function getMealPlansInRange(from: string, to: string): Promise<MealPlanEntry[]> {
  const ctx = await getMealPlanAuthContext();
  if (!ctx) return [];
  const { data, error } = await ctx.supabase
    .from("meal_plans")
    .select(`plan_id, plan_date, meal_type, dish_id, created_at, dishes (${DISH_EMBED})`)
    .gte("plan_date", from)
    .lte("plan_date", to)
    .order("plan_date")
    .order("meal_type");

  if (error) {
    console.error("getMealPlansInRange:", error.message);
    return [];
  }
  const rows = (data ?? []) as MealPlanRow[];
  const cuisineIds = rows.flatMap((r) => { const d = Array.isArray(r.dishes) ? r.dishes[0] : r.dishes; return d?.cuisine_id ? [d.cuisine_id] : []; });
  const cuisineMap = await loadCuisineNameMap(ctx.supabase, cuisineIds);
  return rows
    .map((r) => mapPlanRow(r, cuisineMap))
    .filter((p): p is MealPlanEntry => p != null);
}

export async function addMealPlan(planDate: string, mealType: MealType, dishId: string) {
  const ctx = await getMealPlanAuthContext();
  if (!ctx) return { plan: null, error: "Unauthorized" };
  const { data: existing } = await ctx.supabase.from("meal_plans").select("plan_id").eq("plan_date", planDate).eq("meal_type", mealType).maybeSingle();
  if (existing) return { plan: null, error: `${mealType} is already planned for this date` };
  const { data, error } = await ctx.supabase.from("meal_plans").insert({ user_id: ctx.user.id, plan_date: planDate, meal_type: mealType, dish_id: dishId }).select(`plan_id, plan_date, meal_type, dish_id, created_at, dishes (${DISH_EMBED})`).single();
  if (error) return { plan: null, error: error.code === "23505" ? `${mealType} is already planned for this date` : "Failed to add meal plan" };
  const row = data as MealPlanRow;
  const dish = Array.isArray(row.dishes) ? row.dishes[0] : row.dishes;
  const cuisineMap = await loadCuisineNameMap(ctx.supabase, dish?.cuisine_id ? [dish.cuisine_id] : []);
  return { plan: mapPlanRow(row, cuisineMap), error: null };
}

export async function removeMealPlan(planId: number): Promise<boolean> {
  const ctx = await getMealPlanAuthContext();
  if (!ctx) return false;
  const { error } = await ctx.supabase.from("meal_plans").delete().eq("plan_id", planId);
  return !error;
}

type ShoppingRow = { id: number; plan_date?: string; ingredient_name: string; quantity: string; is_purchased?: boolean; purchased?: boolean; created_at: string; shopping_list_id?: number };
function mapShoppingRow(row: ShoppingRow, planDate: string): ShoppingListItem {
  return { id: row.id, planDate, ingredientName: row.ingredient_name, quantity: row.quantity ?? "", purchased: row.is_purchased ?? row.purchased ?? false, createdAt: row.created_at };
}

export async function getAllShoppingListItems(): Promise<ShoppingListItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { error: probe } = await supabase.from("shopping_list_items").select("id").limit(1);
  if (!probe) {
    const { data: lists } = await supabase.from("shopping_lists").select("id, plan_date");
    const dates = new Map((lists ?? []).map((l) => [l.id, l.plan_date]));
    const { data } = await supabase.from("shopping_list_items").select("id, shopping_list_id, ingredient_name, quantity, is_purchased, created_at").order("ingredient_name");
    return (data ?? []).map((r) => mapShoppingRow(r as ShoppingRow, dates.get((r as {shopping_list_id:number}).shopping_list_id) ?? ""));
  }
  const { data } = await supabase.from("shopping_lists").select("id, plan_date, ingredient_name, quantity, is_purchased, purchased, created_at").neq("ingredient_name", "__shopping_list__").order("ingredient_name");
  return (data ?? []).map((r) => mapShoppingRow(r as ShoppingRow, r.plan_date ?? ""));
}

export async function setShoppingItemPurchased(id: number, purchased: boolean): Promise<ShoppingListItem | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shopping_list_items").update({ is_purchased: purchased }).eq("id", id).select("id, shopping_list_id, ingredient_name, quantity, is_purchased, created_at").maybeSingle();
  if (!error && data) {
    const { data: list } = await supabase.from("shopping_lists").select("plan_date").eq("id", data.shopping_list_id).maybeSingle();
    return mapShoppingRow(data as ShoppingRow, list?.plan_date ?? "");
  }
  const res = await supabase.from("shopping_lists").update({ is_purchased: purchased }).eq("id", id).select("id, plan_date, ingredient_name, quantity, is_purchased, created_at").maybeSingle();
  if (res.data) return mapShoppingRow(res.data as ShoppingRow, res.data.plan_date);
  const alt = await supabase.from("shopping_lists").update({ purchased }).eq("id", id).select("id, plan_date, ingredient_name, quantity, purchased, created_at").maybeSingle();
  return alt.data ? mapShoppingRow(alt.data as ShoppingRow, alt.data.plan_date) : null;
}

export async function deleteShoppingListItem(id: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const a = await supabase.from("shopping_list_items").delete().eq("id", id);
  if (!a.error) return true;
  const b = await supabase.from("shopping_lists").delete().eq("id", id);
  return !b.error;
}
