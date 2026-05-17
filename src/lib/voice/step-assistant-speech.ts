const LOG_PREFIX = "[StepAssistant]";

export function stepAssistantLog(
  event: string,
  detail?: unknown,
): void {
  if (detail !== undefined) {
    console.log(LOG_PREFIX, event, detail);
  } else {
    console.log(LOG_PREFIX, event);
  }
}

export function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isBrowserSpeechSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor()) && typeof window !== "undefined";
}

export function isBrowserTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export async function requestMicrophonePermission(): Promise<{
  granted: boolean;
  error?: string;
}> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      granted: false,
      error: "Microphone is not supported in this browser.",
    };
  }

  try {
    stepAssistantLog("microphone started — requesting permission");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    stepAssistantLog("microphone permission granted");
    return { granted: true };
  } catch (error) {
    const name =
      error instanceof DOMException ? error.name : "UnknownError";
    stepAssistantLog("microphone permission denied", { name, error });

    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return {
        granted: false,
        error:
          "Microphone access was blocked. Allow the mic in your browser settings, or type your question below.",
      };
    }
    if (name === "NotFoundError") {
      return {
        granted: false,
        error: "No microphone was found on this device.",
      };
    }
    return {
      granted: false,
      error: "Could not access the microphone. Try typing your question below.",
    };
  }
}

export function speakWithBrowserTts(
  text: string,
  onEnd?: () => void,
): () => void {
  if (!isBrowserTtsSupported()) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onend = () => {
    stepAssistantLog("browser TTS finished");
    onEnd?.();
  };
  utterance.onerror = (e) => {
    stepAssistantLog("browser TTS error", e);
    onEnd?.();
  };

  stepAssistantLog("browser TTS speaking");
  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    onEnd?.();
  };
}

export function stopBrowserTts(): void {
  if (isBrowserTtsSupported()) {
    window.speechSynthesis.cancel();
  }
}

export type SpeechRecognitionErrorCode =
  | "not-allowed"
  | "no-speech"
  | "network"
  | "aborted"
  | "unknown";

export function mapSpeechRecognitionError(
  code: string,
): { message: string; code: SpeechRecognitionErrorCode } {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return {
        code: "not-allowed",
        message:
          "Microphone access was blocked. Allow the mic in browser settings, or type below.",
      };
    case "no-speech":
      return {
        code: "no-speech",
        message: "I didn't hear anything. Tap the mic and try again.",
      };
    case "network":
      return {
        code: "network",
        message: "Speech recognition needs internet. Check your connection or type below.",
      };
    case "aborted":
      return {
        code: "aborted",
        message: "Listening stopped.",
      };
    default:
      return {
        code: "unknown",
        message: "Speech recognition failed. Try again or type your question.",
      };
  }
}
