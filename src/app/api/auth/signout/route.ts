import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { hasSupabaseAuthConfig } from "@/lib/supabase/env";

export async function POST() {
  if (!hasSupabaseAuthConfig()) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = await createServerAuthClient();
    await supabase.auth.signOut();
  } catch {
    /* cookies may already be cleared */
  }

  return NextResponse.json({ success: true });
}
