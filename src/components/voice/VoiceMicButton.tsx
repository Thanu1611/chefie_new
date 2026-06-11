"use client";

import { IconMicrophone, IconMicrophoneOff, IconVolume } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export type VoiceMicMode = "idle" | "connecting" | "listening" | "speaking";

interface VoiceMicButtonProps {
  mode: VoiceMicMode;
  connected: boolean;
  disabled?: boolean;
  onClick: () => void;
  /** @deprecated Visualizer bars removed — kept for call-site compatibility */
  barLevels?: number[];
  /** @deprecated Visualizer level removed — kept for call-site compatibility */
  averageLevel?: number;
}

function WaterDropRipples({ mode }: { mode: "listening" | "speaking" }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "voice-water-ripple absolute h-24 w-24 rounded-full",
            mode === "listening"
              ? "voice-water-ripple-user"
              : "voice-water-ripple-agent",
          )}
          style={{ animationDelay: `${i * 0.85}s` }}
        />
      ))}
    </div>
  );
}

function VoiceModeIcon({
  mode,
  connected,
  onLightBackground,
}: {
  mode: VoiceMicMode;
  connected: boolean;
  onLightBackground: boolean;
}) {
  const isListening = mode === "listening";
  const isSpeaking = mode === "speaking";
  const showMicOff = connected && !isListening && !isSpeaking;
  const iconColor = onLightBackground ? "text-brand" : "text-white";

  if (showMicOff) {
    return (
      <IconMicrophoneOff size={40} stroke={2} className={iconColor} />
    );
  }

  return (
    <span
      className={cn(
        "relative flex h-10 w-10 items-center justify-center",
        iconColor,
      )}
    >
      <IconMicrophone
        size={40}
        stroke={2}
        className={cn(
          "absolute transition-opacity duration-500 ease-in-out",
          iconColor,
          isListening || (!connected && !isSpeaking)
            ? "opacity-100"
            : "opacity-0",
        )}
        aria-hidden={!isListening && (connected || isSpeaking)}
      />
      <IconVolume
        size={40}
        stroke={2}
        className={cn(
          "absolute transition-opacity duration-500 ease-in-out",
          iconColor,
          isSpeaking ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!isSpeaking}
      />
    </span>
  );
}

export function VoiceMicButton({
  mode,
  connected,
  disabled,
  onClick,
}: VoiceMicButtonProps) {
  const isLive = mode === "listening" || mode === "speaking";
  const onLightBackground =
    mode === "connecting" || (!connected && mode === "idle");

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      {isLive && <WaterDropRipples mode={mode} />}

      {mode === "connecting" && (
        <span
          className="voice-connecting-ring pointer-events-none absolute inset-8 rounded-full"
          aria-hidden
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-colors duration-300 disabled:opacity-60",
          mode === "connecting" && "bg-brand/20 text-brand",
          !connected &&
            mode === "idle" &&
            "bg-brand/15 text-brand hover:bg-brand hover:text-white",
          connected &&
            !isLive &&
            "bg-brand text-white shadow-lg shadow-brand/30",
          isLive &&
            "bg-brand text-white shadow-lg shadow-brand/40 ring-4 ring-brand/25",
        )}
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
        <VoiceModeIcon
          mode={mode}
          connected={connected}
          onLightBackground={onLightBackground}
        />
      </button>
    </div>
  );
}
