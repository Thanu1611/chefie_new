import { NextResponse } from "next/server";
import { getStepCookingHelp } from "@/lib/gemini/step-assistant";
import { getAuthUser } from "@/lib/supabase/server-auth";
import type {
  StepAssistantContext,
  StepAssistantMessage,
} from "@/types/step-assistant";

function isValidStep(step: unknown): step is StepAssistantContext {
  if (!step || typeof step !== "object") return false;
  const s = step as Record<string, unknown>;
  return (
    typeof s.dish_name === "string" &&
    typeof s.step_number === "number" &&
    typeof s.step_title === "string" &&
    typeof s.instruction === "string" &&
    (s.timer_minutes === null || typeof s.timer_minutes === "number") &&
    typeof s.break_time_minutes === "number"
  );
}

function isValidHistory(history: unknown): history is StepAssistantMessage[] {
  if (!Array.isArray(history)) return false;
  return history.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string",
  );
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      step?: unknown;
      question?: string;
      history?: unknown;
    };

    if (!isValidStep(body.step)) {
      return NextResponse.json({ error: "Invalid step context" }, { status: 400 });
    }

    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const history = isValidHistory(body.history) ? body.history : [];

    const reply = await getStepCookingHelp(question, body.step, history);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Could not get step assistant reply" },
      { status: 500 },
    );
  }
}
