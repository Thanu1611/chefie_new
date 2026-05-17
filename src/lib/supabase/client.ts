import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

let supabase: SupabaseClient | null = null;

/** Browser Supabase client (auth + optional client queries). */
export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || !key) return null;

  if (!supabase) {
    supabase = createBrowserClient(url, key);
  }

  return supabase;
}
