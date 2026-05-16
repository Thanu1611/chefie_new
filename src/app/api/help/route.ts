import { NextResponse } from "next/server";
import { getCookingFix } from "@/lib/gemini/help-fix";

export async function POST(request: Request) {
  try {
    const { topic } = (await request.json()) as { topic?: string };
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    const fix = await getCookingFix(topic);
    return NextResponse.json({ fix });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch cooking fix" },
      { status: 500 },
    );
  }
}
