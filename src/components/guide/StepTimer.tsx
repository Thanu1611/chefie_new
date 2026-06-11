"use client";

import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import type { StepTimerControls } from "@/hooks/useStepTimer";
import { cn } from "@/lib/utils/cn";

interface StepTimerProps {
  timer: StepTimerControls;
  variant?: "full" | "compact";
}

export function StepTimer({ timer, variant = "full" }: StepTimerProps) {
  if (!timer.hasTimer) return null;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-warm-200 bg-warm-50/90 px-4 py-2.5 sm:px-5",
          timer.finished && "bg-warning-light/80",
          timer.running && !timer.finished && "bg-brand/5",
        )}
      >
        <IconClock
          size={16}
          className={cn(
            "shrink-0",
            timer.finished ? "text-warning-dark" : "text-brand",
          )}
        />
        <span className="text-xs font-medium text-muted">Step timer</span>
        <span
          className={cn(
            "min-w-[4.5rem] font-mono text-lg font-bold tracking-wider",
            timer.finished ? "text-warning-dark" : "text-brand",
          )}
        >
          {timer.display}
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={timer.toggle}
            className="btn-primary px-2 py-1 text-xs"
            disabled={timer.finished}
            aria-label={timer.running ? "Pause timer" : "Start timer"}
          >
            {timer.running ? (
              <IconPlayerPause size={14} />
            ) : (
              <IconPlayerPlay size={14} />
            )}
          </button>
          <button
            type="button"
            onClick={timer.reset}
            className="btn-secondary px-2 py-1 text-xs"
            aria-label="Reset timer"
          >
            <IconRefresh size={14} />
          </button>
          <button
            type="button"
            onClick={() => timer.addMinutes(5)}
            className="btn-secondary px-2 py-1 text-xs"
            aria-label="Add five minutes"
          >
            <IconPlus size={14} />
            5m
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-warm-200 bg-warm-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <IconClock size={18} className="text-brand" />
        Step timer
      </div>
      <p
        className={cn(
          "mb-4 text-center font-mono text-4xl font-bold tracking-wider",
          timer.finished ? "text-warning-dark" : "text-brand",
        )}
      >
        {timer.display}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={timer.toggle}
          className="btn-primary"
          disabled={timer.finished}
        >
          {timer.running ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          {timer.running ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={timer.reset} className="btn-secondary">
          <IconRefresh size={18} />
          Reset
        </button>
        <button
          type="button"
          onClick={() => timer.addMinutes(5)}
          className="btn-secondary"
        >
          <IconPlus size={18} />
          +5 min
        </button>
      </div>
    </section>
  );
}
