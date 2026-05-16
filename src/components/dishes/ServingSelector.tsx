"use client";

import { IconMinus, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

interface ServingSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function ServingSelector({
  value,
  onChange,
  min = 1,
  max = 24,
  disabled,
  className,
}: ServingSelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease servings"
      >
        <IconMinus size={18} />
      </button>
      <span className="min-w-[4.5rem] text-center">
        <span className="block text-lg font-bold text-foreground">{value}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
          servings
        </span>
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase servings"
      >
        <IconPlus size={18} />
      </button>
    </div>
  );
}
