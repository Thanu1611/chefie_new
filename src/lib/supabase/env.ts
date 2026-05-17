export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

export function getSupabasePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
}

export function hasSupabaseAuthConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}
