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

/** Spoken first message when the step voice session starts. */
export function buildStepVoiceFirstMessage(step: StepAssistantContext): string {
  return `வணக்கம்! நீங்கள் இப்போது ${step.step_number}வது படி: ${step.step_title}. இந்த படி பற்றி எதுவும் கேளுங்கள் — நேரம், texture, தவறுகள், சமையல் குறிப்புகள்.`;
}

/** Context pushed right after connect — safer than prompt overrides (often blocked by agent settings). */
export function buildElevenLabsStepConnectContext(
  step: StepAssistantContext,
): string {
  const vars = buildElevenLabsStepDynamicVariables(step);
  return `[STEP SESSION] User opened the step assistant for ${step.dish_name}.

${vars.assistant_instructions}

Greet the user now in Tamil (2–3 short spoken sentences). Say exactly this idea: "${buildStepVoiceFirstMessage(step)}"
You are the step assistant — NOT the general Chefie Voice. Help only with this step.`;
}

/** Common / dish agent greetings that should not appear in the step assistant chat. */
export function isGenericCommonVoiceGreeting(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  return (
    /chefie voice/i.test(text) ||
    /what ingredients do you have/i.test(normalized) ||
    /what dish are you craving/i.test(normalized) ||
    /what shall we cook/i.test(normalized) ||
    /இன்று என்ன சமைக்கலாம்/.test(text)
  );
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
