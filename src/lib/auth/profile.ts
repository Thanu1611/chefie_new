import type { User } from "@supabase/supabase-js";

export const DISPLAY_NAME_MAX_LENGTH = 12;

export function getDisplayName(user: {
  user_metadata?: { full_name?: string };
  email?: string | null;
}) {
  return (
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Account"
  );
}

export function getProfileInitial(user: User | { user_metadata?: { full_name?: string }; email?: string | null }) {
  return getDisplayName(user).charAt(0).toUpperCase();
}
