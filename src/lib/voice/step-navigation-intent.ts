export type StepNavigationDirection = "next" | "previous";

const PREVIOUS_EXACT = [
  /^previous(\s+step)?$/i,
  /^go\s+back$/i,
  /^back$/i,
];

const NEXT_EXACT = [
  /^next(\s+step|\s+page)?$/i,
  /^next$/i,
  /^(done|completed|finished|ready)$/i,
  /^(i'?m\s+)?(done|ready|finished)$/i,
  /^all\s+done$/i,
  /^move\s+on$/i,
  /^ready\s+for\s+next$/i,
];

/** Cooking questions — not step navigation. */
export function isStepQuestion(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("?")) return true;
  return /^(what|how|why|when|where|can|should|is|does|do|explain|tell\s+me|mean|means)\b/.test(
    normalized,
  );
}

/** Returns navigation direction only for explicit step-change commands. */
export function parseStepNavigationIntent(
  text: string,
): StepNavigationDirection | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  if (PREVIOUS_EXACT.some((pattern) => pattern.test(normalized))) {
    return "previous";
  }

  if (NEXT_EXACT.some((pattern) => pattern.test(normalized))) {
    return "next";
  }

  if (isStepQuestion(trimmed)) {
    return null;
  }

  const wordCount = normalized.split(/\s+/).length;
  if (wordCount <= 4) {
    if (/\b(next|done|ready|finished|completed)\b/.test(normalized)) {
      return "next";
    }
  }

  return null;
}
