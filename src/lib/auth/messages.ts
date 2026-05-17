export type LoginReason =
  | "voice"
  | "generate"
  | "meal-planning"
  | "library"
  | "step-assistant";

export const LOGIN_REASON_MESSAGES: Record<LoginReason, string> = {
  voice: "Please login to use the voice assistant.",
  generate: "Please login to generate custom recipes.",
  "meal-planning": "Please login to use meal planning.",
  library: "Please login to use your library.",
  "step-assistant": "Please login to use the step assistant.",
};

export function getLoginBannerMessage(
  reason: string | null | undefined,
  redirect: string | null | undefined,
): string | null {
  if (
    reason === "voice" ||
    reason === "generate" ||
    reason === "meal-planning" ||
    reason === "library" ||
    reason === "step-assistant"
  ) {
    return LOGIN_REASON_MESSAGES[reason];
  }
  const path = redirect?.split("?")[0] ?? "";
  if (path === "/voice" || path.startsWith("/voice/")) {
    return LOGIN_REASON_MESSAGES.voice;
  }
  if (path === "/generate" || path.startsWith("/generate/")) {
    return LOGIN_REASON_MESSAGES.generate;
  }
  if (
    path === "/meal-planning" ||
    path.startsWith("/meal-planning/") ||
    path === "/shopping-list" ||
    path.startsWith("/shopping-list/")
  ) {
    return LOGIN_REASON_MESSAGES["meal-planning"];
  }
  if (path === "/library" || path.startsWith("/library/")) {
    return LOGIN_REASON_MESSAGES.library;
  }
  if (path === "/guide" || path.startsWith("/guide/")) {
    return LOGIN_REASON_MESSAGES["step-assistant"];
  }
  return null;
}
