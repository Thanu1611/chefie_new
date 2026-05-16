import { NextResponse } from "next/server";
import { isPastDateKey, toDateKey } from "@/lib/meal-plan/dates";
import { getPlanAddStatus } from "@/lib/supabase/shopping-list-sources";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const today = toDateKey(new Date());

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to date parameters are required" },
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

  try {
    const status = await getPlanAddStatus(from, to);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to check plan status" },
      { status: 500 },
    );
  }
}
