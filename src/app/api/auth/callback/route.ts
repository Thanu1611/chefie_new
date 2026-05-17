import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { isSafeGuestRedirect } from "@/lib/auth/protected-paths";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = isSafeGuestRedirect(next) ? next : "/";
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
