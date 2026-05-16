import { NextResponse } from "next/server";
import { getDishById } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const dish = await getDishById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json({ dish });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dish" },
      { status: 500 },
    );
  }
}
