import { NextResponse, type NextRequest } from "next/server";
import {
  isProtectedApiPath,
  isProtectedPagePath,
  isSafeGuestRedirect,
  loginReasonForPath,
} from "@/lib/auth/protected-paths";
import { hasSupabaseAuthConfig } from "@/lib/supabase/env";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  if (!hasSupabaseAuthConfig()) {
    return response;
  }

  const supabase = createMiddlewareSupabaseClient(request, response);
  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPagePath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "redirect",
      `${pathname}${request.nextUrl.search}`,
    );
    const reason = loginReasonForPath(pathname);
    if (reason) {
      loginUrl.searchParams.set("reason", reason);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isProtectedApiPath(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user && pathname === "/login") {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target = isSafeGuestRedirect(redirect) ? redirect! : "/";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
