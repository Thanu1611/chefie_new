import { NextRequest, NextResponse } from "next/server";
import {
  addUserSavedDish,
  listUserSavedDishes,
  removeUserSavedDish,
} from "@/lib/supabase/library-queries";
import { createServerAuthClient, getAuthUser } from "@/lib/supabase/server-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServerAuthClient();
    const items = await listUserSavedDishes(supabase);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/library:", e);
    return NextResponse.json(
      { error: "Failed to load library" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const dishId = String(body.dishId ?? "").trim();
    const dishName = String(body.dishName ?? dishId).trim();

    if (!dishId) {
      return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
    }

    const supabase = await createServerAuthClient();
    const ok = await addUserSavedDish(supabase, user.id, dishId, dishName);
    if (!ok) {
      return NextResponse.json(
        { error: "Could not save dish. Run supabase/library-user-saved-dishes.sql if the table is not migrated." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/library:", e);
    return NextResponse.json({ error: "Failed to save dish" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dishId = new URL(req.url).searchParams.get("dishId")?.trim();
  if (!dishId) {
    return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
  }

  try {
    const supabase = await createServerAuthClient();
    const ok = await removeUserSavedDish(supabase, dishId);
    if (!ok) {
      return NextResponse.json({ error: "Failed to remove dish" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/library:", e);
    return NextResponse.json({ error: "Failed to remove dish" }, { status: 500 });
  }
}
