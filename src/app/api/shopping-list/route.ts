import { NextResponse } from "next/server";
import {
  deleteShoppingListItem,
  getAllShoppingListItems,
  setShoppingItemPurchased,
} from "@/lib/supabase/meal-plan-queries";

export async function GET() {
  try {
    const items = await getAllShoppingListItems();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load shopping list" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: number; purchased?: boolean };
    if (body.id == null || body.purchased == null) {
      return NextResponse.json(
        { error: "id and purchased are required" },
        { status: 400 },
      );
    }

    const item = await setShoppingItemPurchased(body.id, body.purchased);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const ok = await deleteShoppingListItem(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
