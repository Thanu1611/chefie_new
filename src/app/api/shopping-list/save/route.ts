import { NextResponse } from "next/server";
import { isPastDateKey, toDateKey } from "@/lib/meal-plan/dates";
import { addMealPlansToViewList } from "@/lib/supabase/shopping-list-sources";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { from?: string; to?: string };
    const from = body.from?.trim();
    const to = body.to?.trim();
    const today = toDateKey(new Date());

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to dates are required" },
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

    const result = await addMealPlansToViewList(from, to);

    if (result.status.status === "empty") {
      return NextResponse.json({ error: result.status.message }, { status: 400 });
    }

    if (result.status.status === "all_added") {
      return NextResponse.json({ error: result.status.message }, { status: 409 });
    }

    if (result.plansAdded === 0) {
      return NextResponse.json(
        {
          error:
            result.error ??
            "Could not add meals. Check shopping_list_items and shopping_list_sources tables.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Added to View List",
      plansAdded: result.plansAdded,
      plansSkipped: result.plansSkipped,
      itemsTouched: result.itemsTouched,
      status: result.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save shopping list" },
      { status: 500 },
    );
  }
}
