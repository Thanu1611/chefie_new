import { NextResponse } from "next/server";
import { getAllCuisines } from "@/lib/db/queries";

export async function GET() {
  try {
    const data = await getAllCuisines();
    if (data.length === 0) {
      return NextResponse.json(
        { error: "No cuisines found. Run npm run db:migrate && npm run db:seed" },
        { status: 503 },
      );
    }
    return NextResponse.json({ cuisines: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to load cuisines" },
      { status: 500 },
    );
  }
}
