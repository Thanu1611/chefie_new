import { GEMINI_TAMIL_INSTRUCTION } from "@/lib/i18n/language";
import type { StepAssistantContext } from "@/types/step-assistant";

/** Instructions for the step agent (mirror COMMON agent: conversational + interruptible). */
function buildStepAssistantInstructions(step: StepAssistantContext): string {
  const timerLine =
    step.timer_minutes != null && step.timer_minutes > 0
      ? `Timer: ${step.timer_minutes} minutes on this step.`
      : "No timer on this step.";

  const breakLine =
    step.break_time_minutes > 0
      ? `Wait ${step.break_time_minutes} minutes before the next step.`
      : "";

  return [
    "You are the Chefie Step Voice Assistant.",
    "Help ONLY with the current cooking step.",
    "The user may interrupt while you speak — stop immediately, listen, and answer their new question about THIS step.",
    "Do NOT advance to the next step unless they clearly say: next, next step, done, completed, finished, or ready.",
    "Answers: 2–4 short spoken sentences in Tamil. Clear, warm, step-specific.",
    GEMINI_TAMIL_INSTRUCTION,
    `Current: Step ${step.step_number} — ${step.step_title}.`,
    step.instruction,
    timerLine,
    breakLine,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Push new step context without reconnecting the voice session. */
export function buildElevenLabsStepContextUpdate(
  step: StepAssistantContext,
): string {
  const vars = buildElevenLabsStepDynamicVariables(step);
  return `[STEP CHANGE] User moved to step ${step.step_number} of ${step.dish_name}.

${vars.assistant_instructions}

Briefly greet the user and introduce this step in Tamil (2–3 short spoken sentences). Help only with this step.`;
}

/** Dynamic variables — match field names in your ElevenLabs step agent dashboard. */
export function buildElevenLabsStepDynamicVariables(
  step: StepAssistantContext,
): Record<string, string> {
  return {
    dish_name: step.dish_name,
    step_number: String(step.step_number),
    step_title: step.step_title,
    step_instruction: step.instruction,
    timer_minutes:
      step.timer_minutes != null && step.timer_minutes > 0
        ? String(step.timer_minutes)
        : "none",
    break_time_minutes: String(step.break_time_minutes),
    assistant_instructions: buildStepAssistantInstructions(step),
  };
}
