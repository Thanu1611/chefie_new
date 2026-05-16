import { computePlanSnapshotHash } from "@/lib/meal-plan/plan-snapshot-hash";
import { getSupabaseAdmin } from "./server";
import { getMealPlansInRange } from "./meal-plan-queries";

type RangeRow = {
  id: number;
  from_date: string;
  to_date: string;
  plan_snapshot_hash: string;
  created_at: string;
};

export async function getPlansSnapshotForRange(
  from: string,
  to: string,
): Promise<{ plans: Awaited<ReturnType<typeof getMealPlansInRange>>; hash: string }> {
  const plans = await getMealPlansInRange(from, to);
  const hash = computePlanSnapshotHash(plans);
  return { plans, hash };
}

export async function isRangeSnapshotAlreadyAdded(
  from: string,
  to: string,
  planSnapshotHash: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("shopping_list_ranges")
    .select("id")
    .eq("from_date", from)
    .eq("to_date", to)
    .eq("plan_snapshot_hash", planSnapshotHash)
    .maybeSingle();

  if (error) {
    console.error("isRangeSnapshotAlreadyAdded:", error.message);
    return false;
  }

  return data != null;
}

export async function checkShoppingListRange(
  from: string,
  to: string,
): Promise<{
  alreadyAdded: boolean;
  planSnapshotHash: string;
  planCount: number;
}> {
  const { plans, hash } = await getPlansSnapshotForRange(from, to);
  const alreadyAdded = await isRangeSnapshotAlreadyAdded(from, to, hash);

  return {
    alreadyAdded,
    planSnapshotHash: hash,
    planCount: plans.length,
  };
}

export async function saveShoppingListRange(
  from: string,
  to: string,
  planSnapshotHash: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("shopping_list_ranges").insert({
    from_date: from,
    to_date: to,
    plan_snapshot_hash: planSnapshotHash,
  });

  if (error) {
    console.error("saveShoppingListRange:", error.message);
    return false;
  }

  return true;
}

export async function getSavedRanges(): Promise<RangeRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("shopping_list_ranges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedRanges:", error.message);
    return [];
  }

  return (data ?? []) as RangeRow[];
}
