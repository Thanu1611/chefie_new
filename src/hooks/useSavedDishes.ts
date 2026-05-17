"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { SavedDishEntry } from "@/types/library";

export type { SavedDishEntry };

function loginRedirectPath(pathname: string, search: string): string {
  const redirect = `${pathname}${search}`;
  return `/login?redirect=${encodeURIComponent(redirect)}&reason=library`;
}

export function useSavedDishes() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState<SavedDishEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setSaved([]);
      setLoaded(true);
      return;
    }

    try {
      const res = await fetch("/api/library");
      if (!res.ok) {
        setSaved([]);
        return;
      }
      const data = await res.json();
      setSaved((data.items ?? []) as SavedDishEntry[]);
    } catch {
      setSaved([]);
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoaded(false);
    void load();
  }, [authLoading, load]);

  const requireLogin = useCallback(() => {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    router.push(loginRedirectPath(pathname, search));
  }, [pathname, router]);

  const isSaved = useCallback(
    (dishId: string) => saved.some((s) => s.dishId === dishId),
    [saved],
  );

  const toggleSave = useCallback(
    async (dishId: string, dishName: string) => {
      if (!user) {
        requireLogin();
        return false;
      }

      const exists = saved.some((s) => s.dishId === dishId);

      try {
        if (exists) {
          const res = await fetch(
            `/api/library?dishId=${encodeURIComponent(dishId)}`,
            { method: "DELETE" },
          );
          if (!res.ok) return false;
          setSaved((prev) => prev.filter((s) => s.dishId !== dishId));
          return false;
        }

        const res = await fetch("/api/library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dishId, dishName }),
        });
        if (!res.ok) return false;
        setSaved((prev) => [...prev, { dishId, dishName }]);
        return true;
      } catch {
        return false;
      }
    },
    [saved, user, requireLogin],
  );

  const remove = useCallback(
    async (dishId: string) => {
      if (!user) {
        requireLogin();
        return;
      }
      const res = await fetch(
        `/api/library?dishId=${encodeURIComponent(dishId)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setSaved((prev) => prev.filter((s) => s.dishId !== dishId));
      }
    },
    [user, requireLogin],
  );

  return {
    saved,
    loaded: loaded && !authLoading,
    isSaved,
    toggleSave,
    remove,
    isLoggedIn: Boolean(user),
  };
}
