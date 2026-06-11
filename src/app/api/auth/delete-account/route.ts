import { NextResponse } from "next/server";
import { getSupabaseAdmin, isUsingSupabaseServiceRole } from "@/lib/supabase/server";
import { createServerAuthClient, getAuthUser } from "@/lib/supabase/server-auth";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isUsingSupabaseServiceRole()) {
    return NextResponse.json(
      {
        error:
          "Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable this feature.",
      },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Could not connect to authentication service." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  try {
    const supabase = await createServerAuthClient();
    await supabase.auth.signOut();
  } catch {
    /* session may already be cleared */
  }

  return NextResponse.json({ success: true });
}
