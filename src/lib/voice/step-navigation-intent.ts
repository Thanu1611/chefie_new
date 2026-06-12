export type StepNavigationDirection = "next" | "previous";

const PREVIOUS_EXACT = [
  /^previous(\s+step)?$/i,
  /^go\s+back$/i,
  /^back$/i,
  /^முந்தைய(\s+படி)?$/u,
  /^பின்னால்$/u,
  /^முன்\s+படி$/u,
];

const NEXT_EXACT = [
  /^next(\s+step|\s+page)?$/i,
  /^next$/i,
  /^(done|completed|finished|ready)$/i,
  /^(i'?m\s+)?(done|ready|finished)$/i,
  /^all\s+done$/i,
  /^move\s+on$/i,
  /^ready\s+for\s+next$/i,
  /^அடுத்த(\s+படி)?$/u,
  /^அடுத்து$/u,
  /^(முடிந்தது|தயார்|முடிச்சுட்டேன்|முடிஞ்சுது)$/u,
];

/** Cooking questions — not step navigation. */
export function isStepQuestion(text: string): boolean {
  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("?")) return true;
  if (
    /^(what|how|why|when|where|can|should|is|does|do|explain|tell\s+me|mean|means)\b/.test(
      normalized,
    )
  ) {
    return true;
  }

  return /^(என்ன|எப்படி|ஏன்|எப்போது|எங்கே|சொல்லு|விளக்கு)/u.test(trimmed);
}

/** Returns navigation direction only for explicit step-change commands. */
export function parseStepNavigationIntent(
  text: string,
): StepNavigationDirection | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  if (PREVIOUS_EXACT.some((pattern) => pattern.test(trimmed))) {
    return "previous";
  }

  if (NEXT_EXACT.some((pattern) => pattern.test(trimmed))) {
    return "next";
  }

  if (isStepQuestion(trimmed)) {
    return null;
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 6) {
    if (
      /\b(next|done|ready|finished|completed)\b/.test(normalized) ||
      /^(அடுத்து|அடுத்த|தயார்|முடிந்தது)/u.test(trimmed)
    ) {
      return "next";
    }
    if (
      /(அடுத்த\s*படி|next\s*step|move\s*on|go\s*next)/iu.test(trimmed) &&
      !isStepQuestion(trimmed)
    ) {
      return "next";
    }
  }

  if (
    trimmed.length <= 48 &&
    /(அடுத்த|தயார்|முடிஞ்ச|முடிச்ச|ready|done|finished)/iu.test(trimmed) &&
    !/(முந்தைய|previous|back|பின்னால்)/iu.test(trimmed) &&
    !isStepQuestion(trimmed)
  ) {
    return "next";
  }

  return null;
}
