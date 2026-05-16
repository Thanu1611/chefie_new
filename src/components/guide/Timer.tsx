"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";

interface TimerProps {
  initialMinutes: number;
}

export function Timer({ initialMinutes }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  return (
    <section className="rounded-2xl border border-warm-200 bg-warm-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <IconClock size={18} className="text-brand" />
        Step timer
      </div>
      <p className="mb-4 text-center font-mono text-4xl font-bold tracking-wider text-brand">
        {display}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="btn-primary"
          disabled={secondsLeft === 0}
        >
          {running ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          {running ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          <IconRefresh size={18} />
          Reset
        </button>
        <button
          type="button"
          onClick={() => setSecondsLeft((s) => s + 300)}
          className="btn-secondary"
        >
          <IconPlus size={18} />
          +5 min
        </button>
      </div>
    </section>
  );
}

