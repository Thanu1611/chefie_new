"use client";

import { useEffect, useRef, useState } from "react";

export const VISUALIZER_BARS = 20;

const MIN_LEVEL = 0.1;
const SMOOTHING = 0.72;

function getVolumeRms(timeData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < timeData.length; i++) {
    const sample = (timeData[i]! - 128) / 128;
    sum += sample * sample;
  }
  return Math.min(1, Math.sqrt(sum / timeData.length) * 3.2);
}

function mapFrequencyData(
  frequencyData: Uint8Array,
  barCount: number,
  volumeBoost: number,
): number[] {
  const levels: number[] = [];
  const step = frequencyData.length / barCount;
  const loudness = 0.35 + volumeBoost * 0.85;

  for (let i = 0; i < barCount; i++) {
    const start = Math.floor(i * step);
    const end = Math.max(start + 1, Math.floor((i + 1) * step));
    let sum = 0;
    for (let j = start; j < end; j++) sum += frequencyData[j] ?? 0;
    const avg = sum / (end - start);
    const normalized = Math.min(1, (avg / 255) * 2.4 * loudness);
    levels.push(Math.max(MIN_LEVEL, normalized));
  }

  return levels;
}

function smoothLevels(prev: number[], next: number[]): number[] {
  return next.map((value, i) => prev[i]! * SMOOTHING + value * (1 - SMOOTHING));
}

export function useMicVisualizer(active: boolean) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: VISUALIZER_BARS }, () => MIN_LEVEL),
  );
  const levelsRef = useRef(levels);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioContextRef.current?.close();
      audioContextRef.current = null;
      setLevels(Array.from({ length: VISUALIZER_BARS }, () => MIN_LEVEL));
      return;
    }

    let cancelled = false;

    const cleanup = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const audioContext = new AudioContext();
        await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.65;
        analyser.minDecibels = -70;
        analyser.maxDecibels = -15;
        source.connect(analyser);

        streamRef.current = stream;
        audioContextRef.current = audioContext;

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        const timeData = new Uint8Array(analyser.fftSize);

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(frequencyData);
          analyser.getByteTimeDomainData(timeData);
          const volume = getVolumeRms(timeData);
          const next = mapFrequencyData(
            frequencyData,
            VISUALIZER_BARS,
            volume,
          );
          setLevels((prev) => smoothLevels(prev, next));
          rafRef.current = requestAnimationFrame(tick);
        };

        tick();
      } catch {
        /* Mic may be owned by voice SDK — idle bars */
      }
    }

    void start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [active]);

  const averageLevel =
    levels.reduce((sum, v) => sum + v, 0) / levels.length;

  return { levels, averageLevel };
}
