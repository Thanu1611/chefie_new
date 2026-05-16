import type { DishWithSteps } from "@/types/dish";

/** Dish-specific agent (cuisine / recipe voice links). */
export type ElevenLabsAgentVariant = "dish" | "common";

export function getElevenLabsAgentVariant(
  dish?: DishWithSteps | null,
): ElevenLabsAgentVariant {
  return dish != null ? "dish" : "common";
}

export function getElevenLabsAgentId(
  variant: ElevenLabsAgentVariant,
): string | undefined {
  const key =
    variant === "dish"
      ? process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY
      : process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY_COMMON;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

export function resolveElevenLabsAgentId(
  dish?: DishWithSteps | null,
): string | undefined {
  return getElevenLabsAgentId(getElevenLabsAgentVariant(dish));
}

export function elevenLabsAgentEnvName(variant: ElevenLabsAgentVariant): string {
  return variant === "dish"
    ? "NEXT_PUBLIC_ELEVENLABS_AGENT_KEY"
    : "NEXT_PUBLIC_ELEVENLABS_AGENT_KEY_COMMON";
}
