"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversation,
  useConversationControls,
  useConversationInput,
  useConversationStatus,
} from "@elevenlabs/react";
import {
  IconMicrophone,
  IconPhoneOff,
  IconVolume,
} from "@tabler/icons-react";
import { VoiceMicButton, type VoiceMicMode } from "@/components/voice/VoiceMicButton";
import { useAgentVisualizer } from "@/hooks/useAgentVisualizer";
import { useMicVisualizer } from "@/hooks/useMicVisualizer";
import {
  buildElevenLabsStepConnectContext,
  buildElevenLabsStepContextUpdate,
  buildElevenLabsStepDynamicVariables,
  isGenericCommonVoiceGreeting,
} from "@/lib/voice/elevenlabs-step-variables";
import { resolveStepElevenLabsAgent } from "@/lib/voice/elevenlabs-agents";
import {
  isStepQuestion,
  parseStepNavigationIntent,
  type StepNavigationDirection,
} from "@/lib/voice/step-navigation-intent";
import { stepAssistantLog } from "@/lib/voice/step-assistant-speech";
import type { StepAssistantContext } from "@/types/step-assistant";

export interface StepAssistantVoiceHandle {
  elevenLabsConnected: boolean;
  sendToVoiceAgent: (text: string) => boolean;
}

interface StepAssistantVoiceBarProps {
  step: StepAssistantContext;
  enabled: boolean;
  loading: boolean;
  onChatMessage: (role: "user" | "assistant", text: string) => void;
  onNavigate?: (direction: StepNavigationDirection) => void;
  onControlsReady?: (controls: StepAssistantVoiceHandle) => void;
}

export function StepAssistantVoiceBar(props: StepAssistantVoiceBarProps) {
  const resolved = resolveStepElevenLabsAgent();
  if (!resolved) return null;

  return (
    <ConversationProvider agentId={resolved.agentId}>
      <StepAssistantVoiceInner {...props} />
    </ConversationProvider>
  );
}

/**
 * Same ElevenLabs pattern as VoiceAssistant (COMMON / dish):
 * ConversationProvider → session API → startSession → mic toggle.
 * Step agent uses variant=step + step dynamic variables.
 */
function StepAssistantVoiceInner({
  step,
  enabled,
  loading,
  onChatMessage,
  onNavigate,
  onControlsReady,
}: StepAssistantVoiceBarProps) {
  const { startSession, endSession } = useConversationControls();
  const { status, message: statusMessage } = useConversationStatus();
  const { sendUserMessage, sendContextualUpdate, isSpeaking, isListening } =
    useConversation();
  const { isMuted, setMuted } = useConversationInput();
  const [connecting, setConnecting] = useState(false);
  const [userInterrupted, setUserInterrupted] = useState(false);
  const navCooldownRef = useRef(false);
  const stepNumberRef = useRef(step.step_number);
  const onChatMessageRef = useRef(onChatMessage);
  const onNavigateRef = useRef(onNavigate);
  const connectedRef = useRef(false);
  onChatMessageRef.current = onChatMessage;
  onNavigateRef.current = onNavigate;

  const connected = status === "connected";
  connectedRef.current = connected;
  const hasError = status === "error";

  const appendMessage = useCallback((role: "user" | "assistant", text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (role === "assistant" && isGenericCommonVoiceGreeting(trimmed)) {
      stepAssistantLog("ignored common-agent greeting in step modal", trimmed);
      return;
    }
    onChatMessageRef.current(role, trimmed);
  }, []);

  const tryNavigate = useCallback((text: string): boolean => {
    const direction = parseStepNavigationIntent(text);
    if (!direction || !onNavigateRef.current || navCooldownRef.current) {
      return false;
    }
    navCooldownRef.current = true;
    stepAssistantLog("step navigation from voice", { direction, text });
    onNavigateRef.current(direction);
    window.setTimeout(() => {
      navCooldownRef.current = false;
    }, 800);
    return true;
  }, []);

  const nudgeAgentForQuestion = useCallback((question: string) => {
    if (!connectedRef.current) return;
    const trimmed = question.trim();
    if (!trimmed || !isStepQuestion(trimmed)) return;
    try {
      sendContextualUpdate(
        `User interrupted with a question about this step only. Answer now in 2–4 short spoken sentences: ${trimmed}`,
      );
    } catch (error) {
      stepAssistantLog("sendContextualUpdate failed", error);
    }
  }, [sendContextualUpdate]);

  const handleUserTranscript = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      appendMessage("user", trimmed);

      if (tryNavigate(trimmed)) return;

      nudgeAgentForQuestion(trimmed);
    },
    [appendMessage, nudgeAgentForQuestion, tryNavigate],
  );

  const pushStepConnectContext = useCallback(() => {
    try {
      sendContextualUpdate(buildElevenLabsStepConnectContext(step));
    } catch (error) {
      stepAssistantLog("step connect context failed", error);
    }
  }, [sendContextualUpdate, step]);

  const sessionCallbacks = useCallback(
    () => ({
      onConnect: () => {
        setConnecting(false);
        setMuted(false);
        setUserInterrupted(false);
        stepAssistantLog("step agent connected", step.step_number);
        window.setTimeout(() => pushStepConnectContext(), 400);
      },
      onDisconnect: () => {
        setConnecting(false);
        setUserInterrupted(false);
      },
      onError: (msg: string) => {
        setConnecting(false);
        setUserInterrupted(false);
        const hint =
          msg.toLowerCase().includes("negotiation") ||
          msg.toLowerCase().includes("rtc")
            ? " Try again, or type below."
            : "";
        appendMessage("assistant", `Could not connect: ${msg}${hint}`);
      },
      onMessage: (props: {
        message: string;
        role?: "user" | "agent";
        source?: "user" | "ai";
      }) => {
        const isUser =
          props.role === "user" || props.source === "user";
        if (isUser) {
          handleUserTranscript(props.message);
        } else {
          appendMessage("assistant", props.message);
        }
      },
      onAgentChatResponsePart: (part: { text?: string }) => {
        if (part.text) appendMessage("assistant", part.text);
      },
      onInterruption: () => {
        setMuted(false);
        setUserInterrupted(true);
        stepAssistantLog("barge-in: user interrupted step agent");
      },
      onModeChange: (mode: { mode?: string }) => {
        if (mode.mode === "listening") {
          setUserInterrupted(false);
        }
      },
    }),
    [appendMessage, handleUserTranscript, pushStepConnectContext, setMuted, step.step_number],
  );

  const beginSession = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/elevenlabs/session?variant=step");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to prepare step voice session");
      }

      const dynamicVariables = buildElevenLabsStepDynamicVariables(step);

      startSession({
        connectionType: "websocket",
        ...(data.signedUrl ? { signedUrl: data.signedUrl as string } : {}),
        connectionDelay: { default: 300 },
        ...sessionCallbacks(),
        dynamicVariables,
      });
    } catch (err) {
      setConnecting(false);
      const msg =
        err instanceof Error ? err.message : "Failed to start step voice session";
      appendMessage("assistant", msg);
    }
  }, [appendMessage, sessionCallbacks, startSession, step]);

  const handleConnect = useCallback(async () => {
    if (connected) {
      endSession();
      return;
    }
    await beginSession();
  }, [beginSession, connected, endSession]);

  useEffect(() => {
    if (status === "connected" || status === "error" || status === "disconnected") {
      setConnecting(false);
    }
  }, [status]);

  useEffect(() => {
    if (!connecting) return;
    const timer = window.setTimeout(() => {
      if (!connectedRef.current) {
        setConnecting(false);
        appendMessage(
          "assistant",
          "Voice connection timed out. Tap Start again, or type your question below.",
        );
      }
    }, 20000);
    return () => window.clearTimeout(timer);
  }, [appendMessage, connecting]);

  useEffect(() => {
    if (!enabled && connected) {
      endSession();
    }
  }, [connected, enabled, endSession]);

  useEffect(() => {
    if (step.step_number === stepNumberRef.current) return;
    stepNumberRef.current = step.step_number;

    if (!connected) return;

    stepAssistantLog("step changed — push context update", step.step_number);
    try {
      sendContextualUpdate(buildElevenLabsStepContextUpdate(step));
    } catch (error) {
      stepAssistantLog("step context update failed — reconnecting", error);
      endSession();
      const timer = window.setTimeout(() => {
        void beginSession();
      }, 400);
      return () => window.clearTimeout(timer);
    }
  }, [beginSession, connected, endSession, sendContextualUpdate, step]);

  const sendToVoiceAgent = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !connected) return false;

      appendMessage("user", trimmed);

      if (tryNavigate(trimmed)) return true;

      try {
        sendUserMessage(trimmed);
        nudgeAgentForQuestion(trimmed);
        return true;
      } catch (error) {
        stepAssistantLog("sendToVoiceAgent failed", error);
        return false;
      }
    },
    [
      appendMessage,
      connected,
      nudgeAgentForQuestion,
      sendUserMessage,
      tryNavigate,
    ],
  );

  useEffect(() => {
    onControlsReady?.({
      elevenLabsConnected: connected,
      sendToVoiceAgent,
    });
  }, [connected, onControlsReady, sendToVoiceAgent]);

  const micActive = connected && isListening && !isMuted;
  const agentActive = connected && isSpeaking && !isListening;
  const { levels: micLevels, averageLevel: micAvg } = useMicVisualizer(micActive);
  const { levels: agentLevels, averageLevel: agentAvg } = useAgentVisualizer(agentActive);

  const micMode: VoiceMicMode = connecting
    ? "connecting"
    : connected
      ? isSpeaking
        ? "speaking"
        : isListening
          ? "listening"
          : "idle"
      : "idle";

  const statusLabel = userInterrupted
    ? "Listening to your question…"
    : connecting
      ? "Connecting..."
      : hasError
        ? (statusMessage ?? "Connection error")
        : connected
          ? isSpeaking
            ? "Speaking… (talk to interrupt)"
            : isListening
              ? "Listening… you can interrupt anytime"
              : "Step voice active"
          : "Tap microphone to start";

  const voiceBusy = loading || connecting;

  return (
    <div className="shrink-0 border-t border-warm-200 bg-warm-50/60 px-4 py-2.5 sm:px-5">
      <div className="flex items-center gap-3">
        <VoiceMicButton
          mode={micMode}
          connected={connected}
          disabled={voiceBusy}
          onClick={() => void handleConnect()}
          barLevels={
            micMode === "listening"
              ? micLevels
              : micMode === "speaking"
                ? agentLevels
                : undefined
          }
          averageLevel={
            micMode === "listening" ? micAvg : micMode === "speaking" ? agentAvg : undefined
          }
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{statusLabel}</p>
          {connected && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                Step agent
              </span>
              {isListening && !isMuted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                  <IconMicrophone size={10} />
                  Listening
                </span>
              )}
              {isSpeaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                  <IconVolume size={10} />
                  Speaking
                </span>
              )}
            </div>
          )}
        </div>
        {connected ? (
          <button
            type="button"
            onClick={() => endSession()}
            className="btn-secondary shrink-0 px-2 py-1 text-xs"
            aria-label="Stop voice"
          >
            <IconPhoneOff size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={voiceBusy}
            className="btn-primary shrink-0 px-2 py-1 text-xs"
          >
            <IconMicrophone size={14} />
            Start
          </button>
        )}
      </div>
      {connected && (
        <button
          type="button"
          onClick={() => setMuted(!isMuted)}
          className="mt-2 text-xs font-medium text-brand hover:underline"
        >
          {isMuted ? "Unmute microphone" : "Mute microphone"}
        </button>
      )}
      <p className="mt-2 text-xs text-muted">
        இந்த படி பற்றி எப்போதும் கேளுங்கள். அடுத்த படிக்கு செல்ல &quot;அடுத்து&quot; அல்லது
        &quot;தயார்&quot; என்று சொல்லுங்கள்.
      </p>
    </div>
  );
}
