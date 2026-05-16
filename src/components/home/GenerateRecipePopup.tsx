"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";

const STORAGE_KEY = "chefie-generate-popup-minimized";

export function GenerateRecipePopup() {
  const [minimized, setMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setMinimized(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const setMinimizedPersisted = (value: boolean) => {
    setMinimized(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  };

  if (!mounted) return null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimizedPersisted(false)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 hover:bg-brand-dark md:bottom-6"
        aria-label="Open recipe generator"
        title="Generate custom recipe"
      >
        <IconSparkles size={22} stroke={1.75} />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-20 right-4 z-40 w-[min(100vw-2rem,18rem)] rounded-2xl border border-warm-200 bg-surface p-4 shadow-lg md:bottom-6"
      role="complementary"
      aria-label="Generate custom recipe"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <IconSparkles size={18} stroke={1.75} />
        </span>
        <button
          type="button"
          onClick={() => setMinimizedPersisted(true)}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-warm-100 hover:text-foreground"
          aria-label="Minimize"
        >
          <IconChevronDown size={18} />
        </button>
      </div>

      <h2 className="text-sm font-bold text-foreground">Have ingredients at home?</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Use AI to create a custom recipe from what you already have.
      </p>

      <Link href="/generate" className="btn-primary mt-3 w-full justify-center text-xs">
        <IconSparkles size={16} />
        Generate custom recipe
      </Link>
    </aside>
  );
}
