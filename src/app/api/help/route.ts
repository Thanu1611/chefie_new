import { NextResponse } from "next/server";
import { getCookingFix, getDishCookingHelp } from "@/lib/gemini/help-fix";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topic?: string;
      question?: string;
      dishContext?: string;
      dishId?: string;
    };

    if (body.dishContext && body.question) {
      const fix = await getDishCookingHelp(body.question, body.dishContext);
      return NextResponse.json({ fix });
    }

    if (!body.topic) {
      return NextResponse.json({ error: "Topic or dish question is required" }, { status: 400 });
    }
    const fix = await getCookingFix(body.topic);
    return NextResponse.json({ fix });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch cooking fix" },
      { status: 500 },
    );
  }
}
