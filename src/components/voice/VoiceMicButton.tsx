"use client";

import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { VISUALIZER_BARS } from "@/hooks/useMicVisualizer";
import { cn } from "@/lib/utils/cn";

export type VoiceMicMode = "idle" | "connecting" | "listening" | "speaking";

interface VoiceMicButtonProps {
  mode: VoiceMicMode;
  connected: boolean;
  disabled?: boolean;
  onClick: () => void;
  /** 0–1 per bar — drives height from real mic or simulated output */
  barLevels?: number[];
  averageLevel?: number;
}

function NeonEqualizer({
  mode,
  barLevels,
  averageLevel = 0.15,
}: {
  mode: "listening" | "speaking";
  barLevels?: number[];
  averageLevel?: number;
}) {
  const variant = mode === "listening" ? "user" : "agent";
  const reactive = Boolean(barLevels?.length);
  const glowScale = 0.85 + averageLevel * 0.35;

  return (
    <div
      className="voice-eq-orb pointer-events-none absolute inset-0"
      aria-hidden
      style={{ transform: `scale(${glowScale})` }}
    >
      <div className={cn("voice-eq-glow", `voice-eq-glow-${variant}`)} />
      {Array.from({ length: VISUALIZER_BARS }, (_, i) => {
        const level = barLevels?.[i] ?? MIN_FALLBACK;
        return (
          <span
            key={i}
            className="voice-eq-slot absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${(360 / VISUALIZER_BARS) * i}deg)` }}
          >
            <span
              className={cn(
                "voice-eq-bar",
                `voice-eq-bar-${variant}`,
                reactive && "voice-eq-bar-reactive",
              )}
              style={{
                transform: `translateY(-54px) scaleY(${level})`,
                opacity: reactive ? 0.45 + level * 0.55 : undefined,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}

const MIN_FALLBACK = 0.12;

export function VoiceMicButton({
  mode,
  connected,
  disabled,
  onClick,
  barLevels,
  averageLevel,
}: VoiceMicButtonProps) {
  const isLive = mode === "listening" || mode === "speaking";
  const showReactiveEq = isLive && barLevels && barLevels.length > 0;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      {isLive && (
        <NeonEqualizer
          mode={mode}
          barLevels={showReactiveEq ? barLevels : undefined}
          averageLevel={averageLevel}
        />
      )}

      {mode === "connecting" && (
        <span
          className="voice-eq-connecting pointer-events-none absolute inset-3 rounded-full"
          aria-hidden
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 disabled:opacity-60",
          mode === "connecting" && "bg-brand/20 text-brand",
          !connected &&
            mode === "idle" &&
            "bg-brand/15 text-brand hover:bg-brand hover:text-white",
          connected && !isLive && "bg-brand text-white shadow-lg shadow-brand/30",
          isLive && mode === "listening" && "voice-mic-core-user text-white",
          isLive && mode === "speaking" && "voice-mic-core-agent text-white",
        )}
        style={
          isLive && averageLevel != null
            ? {
                transform: `scale(${1 + averageLevel * 0.08})`,
              }
            : undefined
        }
        aria-label={
          connected
            ? isLive
              ? mode === "listening"
                ? "Listening — tap to end session"
                : "Assistant speaking"
              : "End voice session"
            : "Start voice session"
        }
      >
        {connected ? (
          isLive ? (
            <IconMicrophone size={40} stroke={1.5} />
          ) : (
            <IconMicrophoneOff size={40} stroke={1.5} />
          )
        ) : (
          <IconMicrophone size={40} stroke={1.5} />
        )}
      </button>
    </div>
  );
}
