"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface StepTimerControls {
  secondsLeft: number;
  running: boolean;
  display: string;
  hasTimer: boolean;
  finished: boolean;
  toggle: () => void;
  reset: () => void;
  addMinutes: (minutes: number) => void;
}

export function useStepTimer(
  initialMinutes: number | null,
  resetKey = 0,
): StepTimerControls {
  const hasTimer = initialMinutes != null && initialMinutes > 0;
  const totalSeconds = hasTimer ? initialMinutes * 60 : 0;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setRunning(false);
  }, [totalSeconds, resetKey]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const display = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  const toggle = useCallback(() => {
    if (secondsLeft <= 0) return;
    setRunning((r) => !r);
  }, [secondsLeft]);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  const addMinutes = useCallback((minutes: number) => {
    setSecondsLeft((s) => s + minutes * 60);
  }, []);

  return {
    secondsLeft,
    running,
    display,
    hasTimer,
    finished: hasTimer && secondsLeft === 0,
    toggle,
    reset,
    addMinutes,
  };
}
