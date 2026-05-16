import {
  formatQuantityValue,
  ingredientMergeKey,
} from "@/lib/dishes/ingredient-scaling";
import { getScaledIngredientsForPlan } from "@/lib/meal-plan/shopping-list-builder";
import { mergeNumericIngredientLines } from "@/lib/meal-plan/shopping-list-merge";
import { toDateKey } from "@/lib/meal-plan/dates";
import type { MealPlanEntry, PlanAddStatus, PlanAddStatusResult } from "@/types/meal-plan";
import { getMealPlansInRange } from "./meal-plan-queries";
import { getSupabaseAdmin } from "./server";

async function usesShoppingListItemsTable(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
): Promise<boolean> {
  const { error } = await supabase.from("shopping_list_items").select("id").limit(1);
  return !error;
}

async function usesShoppingListSourcesTable(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
): Promise<boolean> {
  const { error } = await supabase.from("shopping_list_sources").select("id").limit(1);
  return !error;
}

const SOURCES_RLS_HINT =
  "Missing INSERT permission on shopping_list_sources. In Supabase SQL Editor, run supabase/fix-shopping-list-sources-insert.sql — or add SUPABASE_SERVICE_ROLE_KEY to .env (Dashboard → Settings → API → service_role).";

function isSourcesRlsError(message: string): boolean {
  return message.includes("row-level security policy") && message.includes("shopping_list_sources");
}

function formatItemQuantity(quantity: number | null, unit: string | null): string {
  if (quantity == null) return "1";
  if (unit) return `${formatQuantityValue(quantity)} ${unit}`;
  return formatQuantityValue(quantity);
}

function parseStoredQuantity(quantity: string): number {
  const match = quantity.trim().match(/^([\d.]+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function parseUnitFromQuantity(quantity: string): string | null {
  const match = quantity.trim().match(/^[\d.]+\s+(\S+)/);
  return match ? match[1] : null;
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
      ingredient_name: "__shopping_list__",
      quantity: "",
      is_purchased: false,
    })
    .select("id")
    .single();

  if (error) return null;
  return created.id;
}

export async function getAddedPlanIds(planIds: number[]): Promise<Set<number>> {
  const supabase = getSupabaseAdmin();
  if (!supabase || planIds.length === 0) return new Set();

  const hasSources = await usesShoppingListSourcesTable(supabase);
  if (!hasSources) return new Set();

  const { data, error } = await supabase
    .from("shopping_list_sources")
    .select("plan_id")
    .in("plan_id", planIds);

  if (error) {
    console.error("getAddedPlanIds:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => r.plan_id as number));
}

export function buildPlanAddStatus(
  plans: MealPlanEntry[],
  addedPlanIds: Set<number>,
): PlanAddStatusResult {
  const totalPlans = plans.length;
  const addedPlans = plans.filter((p) => addedPlanIds.has(p.planId)).length;
  const newPlans = totalPlans - addedPlans;

  if (totalPlans === 0) {
    return {
      status: "empty",
      totalPlans: 0,
      addedPlans: 0,
      newPlans: 0,
      message: "No planned meals found for this date range.",
    };
  }

  if (newPlans === 0) {
    return {
      status: "all_added",
      totalPlans,
      addedPlans,
      newPlans: 0,
      message:
        "All planned meals in this date range are already added to View List.",
    };
  }

  if (addedPlans > 0) {
    return {
      status: "partial",
      totalPlans,
      addedPlans,
      newPlans,
      message:
        "Some meals are already added. Only new planned meals will be added.",
    };
  }

  return {
    status: "none_added",
    totalPlans,
    addedPlans: 0,
    newPlans,
    message: "",
  };
}

export async function getPlanAddStatus(
  from: string,
  to: string,
): Promise<PlanAddStatusResult> {
  const plans = await getMealPlansInRange(from, to);
  const planIds = plans.map((p) => p.planId);
  const addedPlanIds = await getAddedPlanIds(planIds);
  return buildPlanAddStatus(plans, addedPlanIds);
}

/** Remove items with no sources; refresh quantities from source counts. */
export async function cleanupShoppingListItems(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const hasItems = await usesShoppingListItemsTable(supabase);
  const hasSources = await usesShoppingListSourcesTable(supabase);
  if (!hasItems || !hasSources) return;

  const { data: items, error: itemsError } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_name");

  if (itemsError || !items) return;

  for (const item of items) {
    const { data: sources, error: srcError } = await supabase
      .from("shopping_list_sources")
      .select("id")
      .eq("shopping_list_item_id", item.id);

    if (srcError) continue;

    const count = sources?.length ?? 0;
    if (count === 0) {
      await supabase.from("shopping_list_items").delete().eq("id", item.id);
    }
  }
}

export async function addMealPlansToViewList(
  from: string,
  to: string,
): Promise<{
  plansAdded: number;
  plansSkipped: number;
  itemsTouched: number;
  status: PlanAddStatusResult;
  error?: string;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      plansAdded: 0,
      plansSkipped: 0,
      itemsTouched: 0,
      status: buildPlanAddStatus([], new Set()),
      error: "Database not configured",
    };
  }

  const plans = await getMealPlansInRange(from, to);
  const addedPlanIds = await getAddedPlanIds(plans.map((p) => p.planId));
  const status = buildPlanAddStatus(plans, addedPlanIds);

  if (status.status === "empty" || status.status === "all_added") {
    return {
      plansAdded: 0,
      plansSkipped: status.addedPlans,
      itemsTouched: 0,
      status,
    };
  }

  const newPlans = plans.filter((p) => !addedPlanIds.has(p.planId));
  const listDate = toDateKey(new Date());
  const listId = await getOrCreateShoppingListId(supabase, listDate);

  if (!listId) {
    return {
      plansAdded: 0,
      plansSkipped: status.addedPlans,
      itemsTouched: 0,
      status,
      error: "Could not create shopping list",
    };
  }

  const itemByMergeKey = new Map<string, { id: number; quantity: string }>();
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_name, quantity");

  for (const row of existingItems ?? []) {
    const unit = parseUnitFromQuantity(row.quantity);
    const key = ingredientMergeKey(row.ingredient_name, unit);
    if (row.ingredient_name.trim()) {
      itemByMergeKey.set(key, { id: row.id, quantity: row.quantity });
    }
  }

  let plansAdded = 0;
  let itemsTouched = 0;
  let lastError: string | undefined;

  for (const plan of newPlans) {
    const scaledLines = await getScaledIngredientsForPlan(plan);
    let planLinked = false;

    for (const line of scaledLines) {
      const mergeKey = ingredientMergeKey(line.ingredientName, line.unit);
      if (!line.ingredientName.trim()) continue;

      const qtyText = formatItemQuantity(line.quantity, line.unit);
      let itemId: number | undefined;
      const existing = itemByMergeKey.get(mergeKey);

      if (existing) {
        itemId = existing.id;
        const merged = mergeNumericIngredientLines([
          {
            ingredientName: line.ingredientName,
            quantity: parseStoredQuantity(existing.quantity),
            unit: line.unit,
          },
          line,
        ]);
        const newQty = merged[0]?.quantity ?? qtyText;
        await supabase
          .from("shopping_list_items")
          .update({ quantity: newQty })
          .eq("id", itemId);
        itemByMergeKey.set(mergeKey, { id: itemId, quantity: newQty });
      } else {
        const { data: inserted, error } = await supabase
          .from("shopping_list_items")
          .insert({
            shopping_list_id: listId,
            ingredient_name: line.ingredientName,
            quantity: qtyText,
            is_purchased: false,
          })
          .select("id")
          .single();

        if (error || inserted?.id == null) {
          lastError = error?.message ?? "Failed to insert item";
          continue;
        }

        itemId = inserted.id;
        itemByMergeKey.set(mergeKey, { id: inserted.id, quantity: qtyText });
        itemsTouched += 1;
      }

      if (itemId == null) continue;

      const { error: sourceError } = await supabase.from("shopping_list_sources").insert({
        shopping_list_item_id: itemId,
        plan_id: plan.planId,
      });

      if (sourceError) {
        if (sourceError.message.includes("duplicate") || sourceError.code === "23505") {
          continue;
        }
        lastError = isSourcesRlsError(sourceError.message)
          ? SOURCES_RLS_HINT
          : sourceError.message;
        continue;
      }

      planLinked = true;
    }

    if (planLinked || scaledLines.length === 0) {
      plansAdded += 1;
    }
  }

  await cleanupShoppingListItems();

  const finalStatus = await getPlanAddStatus(from, to);

  return {
    plansAdded,
    plansSkipped: status.addedPlans,
    itemsTouched,
    status: finalStatus,
    error: lastError,
  };
}
