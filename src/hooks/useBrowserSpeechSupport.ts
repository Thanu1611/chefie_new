"use client";

import { useEffect, useState } from "react";
import { getSpeechRecognitionCtor } from "@/lib/voice/step-assistant-speech";

export type SpeechSupportReason =
  | "supported"
  | "checking"
  | "insecure"
  | "unsupported";

export function useBrowserSpeechSupport() {
  const [reason, setReason] = useState<SpeechSupportReason>("checking");

  useEffect(() => {
    if (typeof window === "undefined") {
      setReason("unsupported");
      return;
    }

    if (!window.isSecureContext) {
      setReason("insecure");
      return;
    }

    setReason(getSpeechRecognitionCtor() ? "supported" : "unsupported");
  }, []);

  const supported = reason === "supported";

  const hint =
    reason === "checking"
      ? null
      : reason === "insecure"
        ? "Voice needs a secure connection (https:// or localhost). You can still type below."
        : reason === "unsupported"
          ? "Voice input isn't available in this browser. Chat works below — try Chrome or Edge."
          : null;

  return { supported, reason, hint };
}
