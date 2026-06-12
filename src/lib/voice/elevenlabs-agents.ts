import type { DishWithSteps } from "@/types/dish";

/** Dish-specific agent (cuisine / recipe voice links). */
export type ElevenLabsAgentVariant = "dish" | "common" | "step";

export function getElevenLabsAgentVariant(
  dish?: DishWithSteps | null,
): ElevenLabsAgentVariant {
  return dish != null ? "dish" : "common";
}

export function getElevenLabsAgentId(
  variant: ElevenLabsAgentVariant,
): string | undefined {
  const key =
    variant === "common"
      ? process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY_COMMON
      : variant === "step"
        ? process.env.NEXT_PUBLIC_ELEVENLABS_STEP_AGENT_KEY
        : process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

/**
 * Step-by-step guide modal — dedicated agent (same pattern as COMMON on /voice).
 * Configure in ElevenLabs dashboard with interruption / barge-in enabled.
 */
export function getStepElevenLabsAgentId(): string | undefined {
  return getElevenLabsAgentId("step");
}

/** Step agent first; fall back to common voice agent without showing config UI. */
export function resolveStepElevenLabsAgent(): {
  agentId: string;
  variant: ElevenLabsAgentVariant;
} | null {
  const stepId = getElevenLabsAgentId("step");
  if (stepId) return { agentId: stepId, variant: "step" };

  const commonId = getElevenLabsAgentId("common");
  if (commonId) return { agentId: commonId, variant: "common" };

  return null;
}

export function resolveElevenLabsAgentId(
  dish?: DishWithSteps | null,
): string | undefined {
  return getElevenLabsAgentId(getElevenLabsAgentVariant(dish));
}

export function elevenLabsAgentEnvName(variant: ElevenLabsAgentVariant): string {
  if (variant === "common") return "NEXT_PUBLIC_ELEVENLABS_AGENT_KEY_COMMON";
  if (variant === "step") return "NEXT_PUBLIC_ELEVENLABS_STEP_AGENT_KEY";
  return "NEXT_PUBLIC_ELEVENLABS_AGENT_KEY";
}

