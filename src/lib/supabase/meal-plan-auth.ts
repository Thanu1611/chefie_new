import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerAuthClient, getAuthUser } from "./server-auth";

export async function getMealPlanAuthContext(): Promise<{
  user: User;
  supabase: SupabaseClient;
} | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createServerAuthClient();
  return { user, supabase };
}
