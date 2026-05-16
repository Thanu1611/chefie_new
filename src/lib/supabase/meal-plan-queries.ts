import {
  mergeQuantityText,
  normalizeIngredientKey,
} from "@/lib/meal-plan/shopping-list-merge";
import { getSupabaseAdmin } from "./server";
import type { DishSearchResult, MealPlanEntry, ShoppingListItem } from "@/types/meal-plan";
import type { DishType, MealType } from "@/types/dish";

type MealPlanRow = {
  plan_id: number;
  plan_date: string;
  meal_type: string;
  dish_id: string;
  servings?: number | null;
  created_at: string;
  dishes:
    | {
        dish_id: string;
        dish_name: string;
        description: string;
        meal_type: string;
        dish_type: string;
        cuisine_id: string;
        image_url: string;
        prep_time: number;
        cooking_time: number;
        base_servings?: number | null;
        cuisines: { cuisine_name: string } | { cuisine_name: string }[] | null;
      }
    | {
        dish_id: string;
        dish_name: string;
        description: string;
        meal_type: string;
        dish_type: string;
        cuisine_id: string;
        image_url: string;
        prep_time: number;
        cooking_time: number;
        base_servings?: number | null;
        cuisines: { cuisine_name: string } | { cuisine_name: string }[] | null;
      }[]
    | null;
};

function mapPlanRow(row: MealPlanRow): MealPlanEntry | null {
  const dishRaw = row.dishes;
  const dish = Array.isArray(dishRaw) ? dishRaw[0] : dishRaw;
  if (!dish) return null;
  const cuisineRel = dish.cuisines;
  const cuisineName = Array.isArray(cuisineRel)
    ? cuisineRel[0]?.cuisine_name
    : cuisineRel?.cuisine_name;

  const baseServings =
    dish.base_servings != null && Number(dish.base_servings) > 0
      ? Number(dish.base_servings)
      : 2;
  const servings =
    row.servings != null && Number(row.servings) > 0
      ? Number(row.servings)
      : baseServings;

  return {
    planId: row.plan_id,
    planDate: String(row.plan_date).slice(0, 10),
    mealType: row.meal_type as MealType,
    dishId: row.dish_id,
    servings,
    baseServings,
    createdAt: row.created_at,
    dishName: dish.dish_name,
    description: dish.description,
    dishType: dish.dish_type as MealPlanEntry["dishType"],
    cuisineId: dish.cuisine_id,
    cuisineName: cuisineName ?? dish.cuisine_id,
    imageUrl: dish.image_url,
    prepTime: dish.prep_time,
    cookingTime: dish.cooking_time,
  };
}

export async function getMealPlansInRange(
  from: string,
  to: string,
): Promise<MealPlanEntry[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("meal_plans")
    .select(
      `
      plan_id,
      plan_date,
      meal_type,
      dish_id,
      servings,
      created_at,
      dishes (
        dish_id,
        dish_name,
        description,
        meal_type,
        dish_type,
        cuisine_id,
        image_url,
        prep_time,
        cooking_time,
        base_servings,
        cuisines ( cuisine_name )
      )
    `,
    )
    .gte("plan_date", from)
    .lte("plan_date", to)
    .order("plan_date")
    .order("meal_type");

  if (error) {
    console.error("getMealPlansInRange:", error.message);
    return [];
  }

  return (data as unknown as MealPlanRow[])
    .map(mapPlanRow)
    .filter((p): p is MealPlanEntry => p != null);
}

export async function getMealPlansForDate(date: string): Promise<MealPlanEntry[]> {
  return getMealPlansInRange(date, date);
}

export async function hasMealTypePlanned(
  planDate: string,
  mealType: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("meal_plans")
    .select("plan_id")
    .eq("plan_date", planDate)
    .eq("meal_type", mealType)
    .maybeSingle();

  if (error) return false;
  return data != null;
}

export async function addMealPlan(
  planDate: string,
  mealType: MealType,
  dishId: string,
  servings = 2,
): Promise<{ plan: MealPlanEntry | null; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { plan: null, error: "Database not configured" };
  }

  const slotTaken = await hasMealTypePlanned(planDate, mealType);
  if (slotTaken) {
    return {
      plan: null,
      error: "This meal type is already planned for this day.",
    };
  }

  const safeServings = servings > 0 ? servings : 2;

  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      plan_date: planDate,
      meal_type: mealType,
      dish_id: dishId,
      servings: safeServings,
    })
    .select("plan_id")
    .single();

  if (error) {
    console.error("addMealPlan:", error.message);
    return { plan: null, error: error.message };
  }

  const plans = await getMealPlansForDate(planDate);
  const plan = plans.find((p) => p.planId === data.plan_id) ?? null;
  return { plan };
}

export async function removeMealPlan(planId: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("meal_plans").delete().eq("plan_id", planId);
  if (error) {
    console.error("removeMealPlan:", error.message);
    return false;
  }

  const { cleanupShoppingListItems } = await import("./shopping-list-sources");
  await cleanupShoppingListItems();

  return true;
}

export async function updateMealPlanServings(
  planId: number,
  servings: number,
): Promise<{ plan: MealPlanEntry | null; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { plan: null, error: "Database not configured" };
  }

  const safeServings = servings > 0 ? servings : 1;

  const { data: existing, error: fetchError } = await supabase
    .from("meal_plans")
    .select("plan_date")
    .eq("plan_id", planId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { plan: null, error: "Meal plan not found" };
  }

  const { error } = await supabase
    .from("meal_plans")
    .update({ servings: safeServings })
    .eq("plan_id", planId);

  if (error) {
    console.error("updateMealPlanServings:", error.message);
    return { plan: null, error: error.message };
  }

  const plans = await getMealPlansForDate(String(existing.plan_date).slice(0, 10));
  const plan = plans.find((p) => p.planId === planId) ?? null;
  return { plan };
}

export async function searchDishesForMealPlan(
  query: string,
  mealType?: MealType,
  dishType?: DishType,
): Promise<DishSearchResult[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let q = supabase
    .from("dishes")
    .select(
      `
      dish_id,
      dish_name,
      description,
      meal_type,
      dish_type,
      cuisine_id,
      image_url,
      prep_time,
      cooking_time,
      base_servings,
      cuisines ( cuisine_name )
    `,
    )
    .order("dish_name")
    .limit(24);

  if (mealType) {
    q = q.eq("meal_type", mealType);
  }

  if (dishType) {
    q = q.eq("dish_type", dishType);
  }

  const trimmed = query.trim();
  if (trimmed) {
    q = q.ilike("dish_name", `%${trimmed}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.error("searchDishesForMealPlan:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const cuisineRel = row.cuisines as
      | { cuisine_name: string }
      | { cuisine_name: string }[]
      | null;
    const cuisineName = Array.isArray(cuisineRel)
      ? cuisineRel[0]?.cuisine_name
      : cuisineRel?.cuisine_name;

    const baseServings =
      row.base_servings != null && Number(row.base_servings) > 0
        ? Number(row.base_servings)
        : 2;

    return {
      dishId: row.dish_id,
      dishName: row.dish_name,
      description: row.description,
      mealType: row.meal_type as MealType,
      dishType: row.dish_type as DishSearchResult["dishType"],
      cuisineId: row.cuisine_id,
      cuisineName: cuisineName ?? row.cuisine_id,
      imageUrl: row.image_url,
      prepTime: row.prep_time,
      cookingTime: row.cooking_time,
      baseServings,
    };
  });
}

export async function getMealPlansFromToday(
  todayKey: string,
): Promise<MealPlanEntry[]> {
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  const endKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  const plans = await getMealPlansInRange(todayKey, endKey);
  return plans.filter((p) => p.planDate >= todayKey);
}

const LIST_HEADER_MARKER = "__shopping_list__";

type ShoppingListDbRow = {
  id: number;
  plan_date?: string | null;
  ingredient_name: string;
  quantity: string | null;
  is_purchased?: boolean | null;
  purchased?: boolean | null;
  created_at: string;
  shopping_list_id?: number;
};

type ShoppingListItemDbRow = {
  id: number;
  shopping_list_id: number;
  ingredient_name: string;
  quantity: string | null;
  is_purchased: boolean | null;
  created_at: string;
  shopping_lists?: { plan_date: string } | { plan_date: string }[] | null;
};

function readPurchased(row: { is_purchased?: boolean | null; purchased?: boolean | null }): boolean {
  return Boolean(row.is_purchased ?? row.purchased);
}

function mapFlatShoppingRow(row: ShoppingListDbRow): ShoppingListItem {
  return {
    id: row.id,
    planDate: String(row.plan_date ?? "").slice(0, 10),
    ingredientName: row.ingredient_name,
    quantity: row.quantity ?? "",
    purchased: readPurchased(row),
    createdAt: row.created_at,
  };
}

function mapItemShoppingRow(row: ShoppingListItemDbRow): ShoppingListItem {
  const listRel = row.shopping_lists;
  const planDate = Array.isArray(listRel)
    ? listRel[0]?.plan_date
    : listRel?.plan_date;

  return {
    id: row.id,
    planDate: String(planDate ?? "").slice(0, 10),
    ingredientName: row.ingredient_name,
    quantity: row.quantity ?? "",
    purchased: Boolean(row.is_purchased),
    createdAt: row.created_at,
  };
}

async function getOrCreateShoppingListId(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  listDate: string,
): Promise<number | null> {
  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("plan_date", listDate)
    .order("id", { ascending: true })
    .limit(1);

  if (existing?.[0]?.id) return existing[0].id;

  const { data: created, error } = await supabase
    .from("shopping_lists")
    .insert({
      plan_date: listDate,
      ingredient_name: LIST_HEADER_MARKER,
      quantity: "",
      is_purchased: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("getOrCreateShoppingListId:", error.message);
    return null;
  }

  return created.id;
}

async function fetchFromShoppingListItems(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
): Promise<ShoppingListItem[] | null> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select(
      `
      id,
      shopping_list_id,
      ingredient_name,
      quantity,
      is_purchased,
      created_at,
      shopping_lists ( plan_date )
    `,
    )
    .order("ingredient_name");

  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01") {
      return null;
    }
    console.error("fetchFromShoppingListItems:", error.message);
    return [];
  }

  return (data as ShoppingListItemDbRow[]).map(mapItemShoppingRow);
}

async function fetchFromFlatShoppingLists(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .neq("ingredient_name", LIST_HEADER_MARKER)
    .order("ingredient_name");

  if (error) {
    console.error("fetchFromFlatShoppingLists:", error.message);
    return [];
  }

  return (data as ShoppingListDbRow[]).map(mapFlatShoppingRow);
}

async function usesShoppingListItemsTable(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
): Promise<boolean> {
  const { error } = await supabase.from("shopping_list_items").select("id").limit(1);
  return !error;
}

export async function getAllShoppingListItems(): Promise<ShoppingListItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const hasItemsTable = await usesShoppingListItemsTable(supabase);
  const flat = await fetchFromFlatShoppingLists(supabase);

  if (!hasItemsTable) return flat;

  const fromItems = (await fetchFromShoppingListItems(supabase)) ?? [];
  const byKey = new Map<string, ShoppingListItem>();

  for (const row of flat) {
    byKey.set(normalizeIngredientKey(row.ingredientName), row);
  }
  for (const row of fromItems) {
    byKey.set(normalizeIngredientKey(row.ingredientName), row);
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    return a.ingredientName.localeCompare(b.ingredientName);
  });
}

export async function mergeIntoShoppingList(
  items: { ingredientName: string; quantity: string }[],
  listDate: string,
): Promise<{ items: ShoppingListItem[]; added: number; updated: number; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { items: [], added: 0, updated: 0, error: "Database not configured" };
  }

  const existing = await getAllShoppingListItems();
  const byKey = new Map(
    existing.map((row) => [normalizeIngredientKey(row.ingredientName), row]),
  );

  let added = 0;
  let updated = 0;
  let lastError: string | undefined;

  const hasItemsTable = await usesShoppingListItemsTable(supabase);
  const listId = hasItemsTable ? await getOrCreateShoppingListId(supabase, listDate) : null;

  for (const item of items) {
    const key = normalizeIngredientKey(item.ingredientName);
    if (!key) continue;

    const current = byKey.get(key);
    const quantity = current
      ? mergeQuantityText(current.quantity, item.quantity)
      : item.quantity.trim() || "1 dish";

    if (current) {
      let saved = false;

      if (hasItemsTable) {
        const { data, error } = await supabase
          .from("shopping_list_items")
          .update({ quantity })
          .eq("id", current.id)
          .select(
            `
            id,
            shopping_list_id,
            ingredient_name,
            quantity,
            is_purchased,
            created_at,
            shopping_lists ( plan_date )
          `,
          )
          .maybeSingle();

        if (!error && data) {
          byKey.set(key, mapItemShoppingRow(data as ShoppingListItemDbRow));
          updated += 1;
          saved = true;
        } else if (error) {
          lastError = error.message;
        }
      }

      if (!saved) {
        const { data, error } = await supabase
          .from("shopping_lists")
          .update({ quantity })
          .eq("id", current.id)
          .select("*")
          .maybeSingle();

        if (!error && data) {
          byKey.set(key, mapFlatShoppingRow(data as ShoppingListDbRow));
          updated += 1;
        } else if (error) {
          lastError = error.message;
        }
      }
    } else if (hasItemsTable && listId) {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .insert({
          shopping_list_id: listId,
          ingredient_name: item.ingredientName.trim(),
          quantity,
          is_purchased: false,
        })
        .select(
          `
          id,
          shopping_list_id,
          ingredient_name,
          quantity,
          is_purchased,
          created_at,
          shopping_lists ( plan_date )
        `,
        )
        .single();

      if (!error && data) {
        byKey.set(key, mapItemShoppingRow(data as ShoppingListItemDbRow));
        added += 1;
      } else if (error) {
        lastError = error.message;
        const { data: flatData, error: flatError } = await supabase
          .from("shopping_lists")
          .insert({
            plan_date: listDate,
            ingredient_name: item.ingredientName.trim(),
            quantity,
            is_purchased: false,
          })
          .select("*")
          .single();

        if (!flatError && flatData) {
          byKey.set(key, mapFlatShoppingRow(flatData as ShoppingListDbRow));
          added += 1;
          lastError = undefined;
        } else if (flatError) {
          lastError = flatError.message;
        }
      }
    } else {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert({
          plan_date: listDate,
          ingredient_name: item.ingredientName.trim(),
          quantity,
          is_purchased: false,
        })
        .select("*")
        .single();

      if (!error && data) {
        byKey.set(key, mapFlatShoppingRow(data as ShoppingListDbRow));
        added += 1;
      } else if (error) {
        lastError = error.message;
      }
    }
  }

  const merged = [...byKey.values()].sort((a, b) => {
    if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    return a.ingredientName.localeCompare(b.ingredientName);
  });

  return { items: merged, added, updated, error: lastError };
}

export async function deleteShoppingListItem(id: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error: itemsError } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", id);

  if (!itemsError) return true;

  const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
  if (error) {
    console.error("deleteShoppingListItem:", error.message);
    return false;
  }
  return true;
}

export async function setShoppingItemPurchased(
  id: number,
  purchased: boolean,
): Promise<ShoppingListItem | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: itemData, error: itemError } = await supabase
    .from("shopping_list_items")
    .update({ is_purchased: purchased })
    .eq("id", id)
    .select(
      `
      id,
      shopping_list_id,
      ingredient_name,
      quantity,
      is_purchased,
      created_at,
      shopping_lists ( plan_date )
    `,
    )
    .maybeSingle();

  if (!itemError && itemData) {
    return mapItemShoppingRow(itemData as ShoppingListItemDbRow);
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .update({ is_purchased: purchased })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return mapFlatShoppingRow(data as ShoppingListDbRow);
}
