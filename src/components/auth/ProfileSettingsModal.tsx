"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { User } from "@supabase/supabase-js";
import {
  IconCheck,
  IconChevronDown,
  IconLock,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getDisplayName,
  getProfileInitial,
} from "@/lib/auth/profile";
import { getSupabaseClient } from "@/lib/supabase/client";
import { hasSupabaseAuthConfig } from "@/lib/supabase/env";
import { cn } from "@/lib/utils/cn";

const MIN_PASSWORD_LENGTH = 6;

interface ProfileSettingsModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
}

export function ProfileSettingsModal({
  open,
  user,
  onClose,
}: ProfileSettingsModalProps) {
  const email = user.email ?? "";
  const [displayName, setDisplayName] = useState(getDisplayName(user));
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDisplayName(getDisplayName(user));
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name cannot be empty.");
      return;
    }

    if (!hasSupabaseAuthConfig()) {
      setError("Authentication is not configured.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Could not connect to authentication.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });
      if (updateError) throw updateError;
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate() {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("No email on this account.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Could not connect to authentication.");
      return;
    }

    setSaving(true);

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect.");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
      setSuccess("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  const initial = getProfileInitial(user);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="profile-settings-backdrop" role="presentation" onClick={onClose}>
      <div
        className="profile-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="profile-settings-header">
          <h2 id="profile-settings-title" className="text-lg font-bold text-foreground">
            Profile Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-warm-100 hover:text-foreground"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </header>

        <div className="profile-settings-body">
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <span className="profile-settings-avatar-lg">{initial}</span>
            <p className="text-sm text-muted">{email}</p>
          </div>

          {error && <p className="alert-error px-3 py-2">{error}</p>}
          {success && <p className="alert-success px-3 py-2">{success}</p>}

          <form onSubmit={handleSave} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Display Name</span>
              <div className="relative">
                <IconUser
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={displayName}
                  maxLength={DISPLAY_NAME_MAX_LENGTH}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input pl-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  {displayName.length}/{DISPLAY_NAME_MAX_LENGTH}
                </span>
              </div>
            </label>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={saving}
            >
              <IconCheck size={18} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>

          <section className="profile-settings-section">
            <button
              type="button"
              className="profile-settings-toggle"
              onClick={() => setPasswordOpen((prev) => !prev)}
              aria-expanded={passwordOpen}
            >
              <span className="flex items-center gap-2">
                <IconLock size={18} />
                Change Password
              </span>
              <IconChevronDown
                size={18}
                className={cn("transition-transform", passwordOpen && "rotate-180")}
              />
            </button>

            {passwordOpen && (
              <div className="space-y-3 border-t border-warm-200 px-4 py-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="input"
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="input"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn-secondary w-full"
                  disabled={saving}
                  onClick={() => void handlePasswordUpdate()}
                >
                  Update Password
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
