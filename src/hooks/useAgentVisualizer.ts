"use client";

import { useEffect, useRef, useState } from "react";
import { VISUALIZER_BARS } from "./useMicVisualizer";

const MIN_LEVEL = 0.12;

/** Simulated equalizer when the AI is speaking (no output analyser available). */
export function useAgentVisualizer(active: boolean) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: VISUALIZER_BARS }, () => MIN_LEVEL),
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      setLevels(Array.from({ length: VISUALIZER_BARS }, () => MIN_LEVEL));
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setLevels(
        Array.from({ length: VISUALIZER_BARS }, (_, i) => {
          const phase = i * 0.55;
          const wave =
            Math.abs(Math.sin(t * 4.2 + phase)) * 0.45 +
            Math.abs(Math.sin(t * 6.8 + phase * 1.3)) * 0.3 +
            Math.random() * 0.12;
          return Math.min(1, MIN_LEVEL + wave);
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  const averageLevel =
    levels.reduce((sum, v) => sum + v, 0) / levels.length;

  return { levels, averageLevel };
}
