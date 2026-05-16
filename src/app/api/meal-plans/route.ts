import { NextResponse } from "next/server";
import {
  addMealPlan,
  getMealPlansInRange,
  removeMealPlan,
  updateMealPlanServings,
} from "@/lib/supabase/meal-plan-queries";
import type { MealType } from "@/types/dish";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to date parameters are required" },
      { status: 400 },
    );
  }

  try {
    const plans = await getMealPlansInRange(from, to);
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: "Failed to load meal plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      planDate?: string;
      mealType?: MealType;
      dishId?: string;
      servings?: number;
    };

    if (!body.planDate || !body.mealType || !body.dishId) {
      return NextResponse.json(
        { error: "planDate, mealType, and dishId are required" },
        { status: 400 },
      );
    }

    const { plan, error } = await addMealPlan(
      body.planDate,
      body.mealType,
      body.dishId,
      body.servings,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 409 });
    }

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Failed to add meal plan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      planId?: number;
      servings?: number;
    };

    if (body.planId == null || body.servings == null) {
      return NextResponse.json(
        { error: "planId and servings are required" },
        { status: 400 },
      );
    }

    const { plan, error } = await updateMealPlanServings(body.planId, body.servings);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Failed to update servings" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("planId");

  if (!id) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  const ok = await removeMealPlan(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "Failed to remove meal plan" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
