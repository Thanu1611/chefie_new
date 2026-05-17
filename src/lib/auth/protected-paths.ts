export const PROTECTED_PAGE_PREFIXES = [
  "/voice",
  "/generate",
  "/meal-planning",
  "/shopping-list",
  "/library",
] as const;

export const PROTECTED_API_PREFIXES = [
  "/api/generate",
  "/api/dishes/add-generated",
  "/api/meal-plans",
  "/api/shopping-list",
  "/api/library",
  "/api/guide/step-assistant",
] as const;

export function isProtectedPagePath(pathname: string): boolean {
  return PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Public dish search for meal planning — page is login-gated; API reads catalog only. */
const PUBLIC_MEAL_PLAN_API_PATHS = ["/api/meal-plans/dishes"] as const;

export function isProtectedApiPath(pathname: string): boolean {
  if (PUBLIC_MEAL_PLAN_API_PATHS.includes(pathname as (typeof PUBLIC_MEAL_PLAN_API_PATHS)[number])) {
    return false;
  }
  return PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function loginReasonForPath(
  pathname: string,
):
  | "voice"
  | "generate"
  | "meal-planning"
  | "library"
  | "step-assistant"
  | null {
  if (pathname === "/voice" || pathname.startsWith("/voice/")) {
    return "voice";
  }
  if (pathname === "/generate" || pathname.startsWith("/generate/")) {
    return "generate";
  }
  if (
    pathname === "/meal-planning" ||
    pathname.startsWith("/meal-planning/") ||
    pathname === "/shopping-list" ||
    pathname.startsWith("/shopping-list/")
  ) {
    return "meal-planning";
  }
  if (pathname === "/library" || pathname.startsWith("/library/")) {
    return "library";
  }
  if (pathname === "/guide" || pathname.startsWith("/guide/")) {
    return "step-assistant";
  }
  return null;
}

export function isSafeGuestRedirect(path: string | null | undefined): boolean {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  if (path.startsWith("/login")) return false;
  return !isProtectedPagePath(path.split("?")[0] ?? path);
}
