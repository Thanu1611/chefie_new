import type { ElevenLabsAgentVariant } from "@/lib/voice/elevenlabs-agents";
import { elevenLabsAgentEnvName } from "@/lib/voice/elevenlabs-agents";

export function getElevenLabsAgentIdFromVariant(
  variant: ElevenLabsAgentVariant,
): string | undefined {
  const key =
    variant === "dish"
      ? process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY
      : process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY_COMMON;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

export function parseElevenLabsAgentVariant(
  value: string | null,
): ElevenLabsAgentVariant | null {
  if (value === "dish" || value === "common") return value;
  return null;
}

export { elevenLabsAgentEnvName };
