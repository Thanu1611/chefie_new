"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconChevronUp,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { ProfileSettingsModal } from "@/components/auth/ProfileSettingsModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDisplayName, getProfileInitial } from "@/lib/auth/profile";
import { cn } from "@/lib/utils/cn";

export function NavbarAuth({ className }: { className?: string }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (pathname === "/login") {
    return null;
  }

  if (loading) {
    return (
      <span className={cn("text-sm text-muted", className)} aria-hidden>
        …
      </span>
    );
  }

  if (user) {
    const display = getDisplayName(user);
    const initial = getProfileInitial(user);
    const email = user.email ?? "";
    return (
      <>
        <div ref={menuRef} className={cn("profile-menu", className)}>
          <button
            type="button"
            className={cn("profile-trigger", open && "profile-trigger-open")}
            aria-label={`${display} account menu`}
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="profile-avatar">
              {initial}
            </span>
            <span className="profile-trigger-text hidden lg:block">
              <span className="block text-sm font-semibold text-foreground">
                {display}
              </span>
              <span className="block max-w-[10rem] truncate text-xs text-muted">
                {email}
              </span>
            </span>
            <IconChevronUp
              size={18}
              className={cn(
                "hidden text-muted transition-transform lg:block",
                !open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <div className="profile-dropdown-panel" role="menu">
              <p className="profile-dropdown-label">Active Account</p>

              <div className="profile-account-row">
                <span className="profile-settings-avatar-sm">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {display}
                  </p>
                  <p className="truncate text-xs text-muted">{email}</p>
                </div>
              </div>

              <div className="profile-action-grid">
                <button
                  type="button"
                  className="profile-action-tile"
                  onClick={() => {
                    setOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <IconSettings size={22} className="text-brand" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="profile-action-tile profile-action-tile-danger"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                >
                  <IconLogout size={22} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <ProfileSettingsModal
          open={settingsOpen}
          user={user}
          onClose={() => setSettingsOpen(false)}
        />
      </>
    );
  }

  const redirect = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <Link href={loginHref} className={cn("btn-login text-sm", className)}>
      Log in
    </Link>
  );
}
