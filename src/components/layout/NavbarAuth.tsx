"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils/cn";

export function NavbarAuth({ className }: { className?: string }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login") {
    return null;
  }

  if (loading) {
    return (
      <span
        className={cn("text-sm text-muted", className)}
        aria-hidden
      >
        …
      </span>
    );
  }

  if (user) {
    const display =
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "Account";

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span
          className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground lg:inline"
          title={user.email ?? undefined}
        >
          <IconUser size={16} className="mr-1 inline -mt-0.5" />
          {display}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="btn-secondary px-3 py-2 text-xs"
          aria-label="Log out"
        >
          <IconLogout size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    );
  }

  const redirect = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <Link href={loginHref} className={cn("btn-secondary text-sm", className)}>
      Log in
    </Link>
  );
}
