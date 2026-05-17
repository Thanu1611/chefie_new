import { generateWithGemini, getGeminiApiKey } from "./client";
import { logGeminiError } from "./errors";
import type {
  StepAssistantContext,
  StepAssistantMessage,
} from "@/types/step-assistant";

function formatTimerMinutes(step: StepAssistantContext): string {
  return step.timer_minutes != null && step.timer_minutes > 0
    ? String(step.timer_minutes)
    : "none";
}

export function buildStepAssistantSystemPrompt(step: StepAssistantContext): string {
  return `You are a step-specific cooking assistant.
Help only with the current step.

Dish: ${step.dish_name}
Step number: ${step.step_number}
Step title: ${step.step_title}
Instruction: ${step.instruction}
Timer minutes: ${formatTimerMinutes(step)}
Break time minutes: ${step.break_time_minutes}

Answer only about this step.
Explain technique, timing, texture, common mistakes, substitutions, and recovery tips.
If the user made a mistake, first reassure them, then give recovery steps.

The user may interrupt mid-explanation with a new question — answer that question directly.
Keep answers short (2–4 sentences), clear, supportive, and easy to read aloud.
Do not advance to the next step unless they explicitly say next, done, completed, finished, or ready.`;
}

function formatHistory(history: StepAssistantMessage[]): string {
  if (history.length === 0) return "";
  const lines = history.map(
    (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
  );
  return `\n\nConversation so far:\n${lines.join("\n")}`;
}

export function getStepAssistantWelcome(step: StepAssistantContext): string {
  return `Hi 👩‍🍳\nYou're currently on Step ${step.step_number}: ${step.step_title}.\nAsk me anything about this step — timing, texture, mistakes, or cooking tips.`;
}

export async function getStepCookingHelp(
  question: string,
  step: StepAssistantContext,
  history: StepAssistantMessage[] = [],
): Promise<string> {
  if (!getGeminiApiKey()) {
    return getStaticStepHelp(question, step);
  }

  const prompt = `${buildStepAssistantSystemPrompt(step)}${formatHistory(history)}

User: ${question}

Assistant:`;

  try {
    const { text } = await generateWithGemini({ prompt, temperature: 0.45 });
    if (text.trim()) return text.trim();
  } catch (error) {
    logGeminiError("getStepCookingHelp", error);
  }

  return getStaticStepHelp(question, step);
}

function getStaticStepHelp(question: string, step: StepAssistantContext): string {
  const q = question.toLowerCase();
  const isMistake =
    /mistake|wrong|burnt|burned|ruined|too much|overcook|failed|help fix|messed up|watery|thick|salty/.test(
      q,
    );

  if (isMistake) {
    return `No worries, we can fix this — it happens while cooking.\n\nFor "${step.step_title}": pause the heat if anything is still on the stove. Taste and check texture before continuing. If something smells burnt or looks black, remove only the burnt part and start that piece again on gentler heat.\n\nTell me exactly what looks or smells off and I'll suggest the safest recovery for this step.`;
  }

  if (/blanch/i.test(q)) {
    return `Blanching means briefly boiling food, then cooling it fast in ice water. For this step, cook just until bright and tender — usually 1–3 minutes — then stop the cooking with cold water so it stays vibrant.`;
  }

  return `For Step ${step.step_number} (${step.step_title}):\n\n• Follow: ${step.instruction}\n• Work slowly and check texture as you go.\n${
    step.timer_minutes
      ? `• Use the ${step.timer_minutes}-minute timer when you start timed work.\n`
      : ""
  }Ask me about technique, timing, or what "done" should look like for this step.`;
}
