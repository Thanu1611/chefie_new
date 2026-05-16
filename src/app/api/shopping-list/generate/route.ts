import { NextResponse } from "next/server";
import { buildShoppingListFromPlans } from "@/lib/meal-plan/shopping-list-builder";
import { isPastDateKey, toDateKey } from "@/lib/meal-plan/dates";
import { getMealPlansInRange } from "@/lib/supabase/meal-plan-queries";
import { getPlanAddStatus } from "@/lib/supabase/shopping-list-sources";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { from?: string; to?: string };
    const from = body.from?.trim();
    const to = body.to?.trim();
    const today = toDateKey(new Date());

    if (!from || !to) {
      return NextResponse.json(
        { error: "From date and To date are required" },
        { status: 400 },
      );
    }

    if (isPastDateKey(from, today)) {
      return NextResponse.json(
        { error: "From date cannot be in the past" },
        { status: 400 },
      );
    }

    if (to < from) {
      return NextResponse.json(
        { error: "To date cannot be before From date" },
        { status: 400 },
      );
    }

    const plans = await getMealPlansInRange(from, to);
    const items = await buildShoppingListFromPlans(plans);
    const planStatus = await getPlanAddStatus(from, to);

    return NextResponse.json({
      items,
      planCount: plans.length,
      fromDate: from,
      toDate: to,
      planStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 },
    );
  }
}
