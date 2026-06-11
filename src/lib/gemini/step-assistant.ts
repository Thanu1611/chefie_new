import { GEMINI_TAMIL_INSTRUCTION } from "@/lib/i18n/language";
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
Do not advance to the next step unless they explicitly say next, done, completed, finished, or ready.

${GEMINI_TAMIL_INSTRUCTION}`;
}

function formatHistory(history: StepAssistantMessage[]): string {
  if (history.length === 0) return "";
  const lines = history.map(
    (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
  );
  return `\n\nConversation so far:\n${lines.join("\n")}`;
}

export function getStepAssistantWelcome(step: StepAssistantContext): string {
  return `வணக்கம் 👩‍🍳\nநீங்கள் இப்போது ${step.step_number}வது படி: ${step.step_title}.\nஇந்த படி பற்றி எதுவும் கேளுங்கள் — நேரம், texture, தவறுகள், சமையல் குறிப்புகள்.`;
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
    return `"${step.step_title}" படியில் கவலை வேண்டாம் — சமைக்கும்போது இது நடக்கும்.\n\nஅடுப்பில் ஏதாவது இருந்தால் heat குறையுங்கள். தொடர்வதற்கு முன் சுவை பார்த்து texture சரிபாருங்கள். எரிந்த வாசனை அல்லது கருப்பாகத் தெரிந்தால், எரிந்த பகுதியை மட்டும் எடுத்து மெதுவான heat-ல் மீண்டும் செய்யுங்கள்.\n\nஎன்ன தவறாகத் தெரிகிறது என்று சொல்லுங்கள் — இந்த படிக்கு பாதுகாப்பான தீர்வு சொல்கிறேன்.`;
  }

  if (/blanch/i.test(q)) {
    return `Blanching என்றால் சிறிது நேரம் boil செய்து, உடனே ice water-ல் குளிர வைப்பது. இந்த படியில் பொருள் பிரகாசமாகவும் மென்மையாகவும் ஆகும் வரை — பொதுவாக 1–3 நிமிடம் — வேகவிட்டு, cold water-ல் வேகம் நிறுத்துங்கள்.`;
  }

  return `${step.step_number}வது படி (${step.step_title}):\n\n• ${step.instruction}\n• மெதுவாக செய்து texture சரிபாருங்கள்.\n${
    step.timer_minutes
      ? `• timed work தொடங்கும்போது ${step.timer_minutes} நிமிட timer பயன்படுத்துங்கள்.\n`
      : ""
  }technique, timing, அல்லது "done" எப்படி இருக்கும் என்று கேளுங்கள்.`;
}
