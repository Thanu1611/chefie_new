"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconRobot,
  IconSend,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import {
  StepAssistantVoiceBar,
  type StepAssistantVoiceHandle,
} from "@/components/guide/StepAssistantVoiceBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { getStepAssistantWelcome } from "@/lib/gemini/step-assistant";
import {
  parseStepNavigationIntent,
  type StepNavigationDirection,
} from "@/lib/voice/step-navigation-intent";
import { stepAssistantLog } from "@/lib/voice/step-assistant-speech";
import { StepTimer } from "@/components/guide/StepTimer";
import { cn } from "@/lib/utils/cn";
import type { StepTimerControls } from "@/hooks/useStepTimer";
import type {
  StepAssistantContext,
  StepAssistantMessage,
} from "@/types/step-assistant";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface StepAssistantPanelProps {
  open: boolean;
  step: StepAssistantContext;
  timer?: StepTimerControls;
  currentStepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  canGoPrevious: boolean;
  onGoNext: () => void;
  onGoPrevious: () => void;
  onClose: () => void;
}

export function StepAssistantPanel({
  open,
  step,
  timer,
  currentStepIndex,
  totalSteps,
  isLastStep,
  canGoPrevious,
  onGoNext,
  onGoPrevious,
  onClose,
}: StepAssistantPanelProps) {
  if (!open) return null;
  return (
    <StepAssistantModal
      open={open}
      step={step}
      timer={timer}
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      isLastStep={isLastStep}
      canGoPrevious={canGoPrevious}
      onGoNext={onGoNext}
      onGoPrevious={onGoPrevious}
      onClose={onClose}
    />
  );
}

function StepAssistantModal({
  open,
  step,
  timer,
  currentStepIndex,
  totalSteps,
  isLastStep,
  canGoPrevious,
  onGoNext,
  onGoPrevious,
  onClose,
}: StepAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const navCooldownRef = useRef(false);
  const voiceControlsRef = useRef<StepAssistantVoiceHandle>({
    elevenLabsConnected: false,
    sendToVoiceAgent: () => false,
  });
  const stepKey = `${step.dish_name}-${step.step_number}`;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const welcome: ChatMessage = {
      id: `welcome-${stepKey}`,
      role: "assistant",
      text: getStepAssistantWelcome(step),
    };
    setMessages([welcome]);
    messagesRef.current = [welcome];
    setText("");
    setLoading(false);
    navCooldownRef.current = false;
    stepAssistantLog("step assistant synced", { step: stepKey });
  }, [open, stepKey, step]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const appendMessage = useCallback((role: ChatMessage["role"], messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    setMessages((prev) => {
      const next = [
        ...prev,
        { id: `${role}-${Date.now()}-${Math.random()}`, role, text: trimmed },
      ];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const handleNavigation = useCallback(
    (direction: StepNavigationDirection) => {
      if (navCooldownRef.current) return;
      navCooldownRef.current = true;

      if (direction === "previous") {
        if (!canGoPrevious) {
          appendMessage("assistant", "நீங்கள் ஏற்கனவே முதல் படியில் இருக்கிறீர்கள்.");
          navCooldownRef.current = false;
          return;
        }
        onGoPrevious();
        appendMessage("assistant", "முந்தைய படிக்கு திரும்புகிறோம்…");
        navCooldownRef.current = false;
        return;
      }

      if (isLastStep) {
        appendMessage(
          "assistant",
          "இது கடைசி படி. உங்கள் dish ஏறக்குறைய தயார்!",
        );
        navCooldownRef.current = false;
        return;
      }

      const finishedStep = step.step_number;
      onGoNext();
      appendMessage(
        "assistant",
        `${finishedStep}வது படி நன்றாக முடிந்தது! அடுத்த படிக்கு செல்கிறோம்…`,
      );
      navCooldownRef.current = false;
    },
    [
      appendMessage,
      canGoPrevious,
      isLastStep,
      onGoNext,
      onGoPrevious,
      step.step_number,
    ],
  );

  const tryHandleNavigationCommand = useCallback(
    (utterance: string): boolean => {
      const direction = parseStepNavigationIntent(utterance);
      if (!direction) return false;
      handleNavigation(direction);
      return true;
    },
    [handleNavigation],
  );

  const fetchAssistantReply = useCallback(
    async (question: string): Promise<string | null> => {
      const trimmed = question.trim();
      if (!trimmed) return null;

      const prior = messagesRef.current.filter((m) => m.id !== `welcome-${stepKey}`);
      const history: StepAssistantMessage[] = prior.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/guide/step-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, question: trimmed, history }),
      });
      const data = await res.json();
      return (
        data.reply ??
        data.error ??
        "பதில் சொல்ல முடியவில்லை — இந்த படியின் technique அல்லது timing பற்றி கேளுங்கள்."
      );
    },
    [step, stepKey],
  );

  const sendChatMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      appendMessage("user", trimmed);

      if (tryHandleNavigationCommand(trimmed)) return;

      if (voiceControlsRef.current.elevenLabsConnected) {
        const sent = voiceControlsRef.current.sendToVoiceAgent(trimmed);
        if (sent) return;
      }

      setLoading(true);
      try {
        const reply = await fetchAssistantReply(trimmed);
        if (reply) appendMessage("assistant", reply);
      } catch (error) {
        stepAssistantLog("chat request failed", error);
        appendMessage(
          "assistant",
          "ஏதோ தவறு நடந்தது. இந்த படி பற்றி மீண்டும் கேளுங்கள்.",
        );
      } finally {
        setLoading(false);
      }
    },
    [appendMessage, fetchAssistantReply, loading, tryHandleNavigationCommand],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const question = text.trim();
    if (!question || loading) return;
    setText("");
    void sendChatMessage(question);
  };

  return (
    <div
      className="overlay-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-assistant-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close assistant"
        onClick={onClose}
      />
      <article
        className={cn(
          "step-assistant-sheet relative z-10 flex w-full flex-col bg-background shadow-xl",
          "max-h-[min(92dvh,720px)] min-h-0 rounded-t-3xl sm:max-w-lg sm:rounded-3xl",
        )}
      >
        <header
          key={stepKey}
          className="shrink-0 border-b border-brand/20 bg-brand/5 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
                <IconRobot className="h-5 w-5 text-brand" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                Step {step.step_number} of {totalSteps}
              </p>
              <h2
                id="step-assistant-title"
                className="mt-1 text-lg font-bold leading-snug text-foreground"
              >
                {step.step_title}
              </h2>
              <p className="mt-0.5 text-sm text-muted">{step.dish_name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-muted transition-colors hover:bg-warm-100"
              aria-label="Close"
            >
              <IconX size={20} />
            </button>
          </div>
        </header>

        {timer?.hasTimer ? <StepTimer timer={timer} variant="compact" /> : null}

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex step-assistant-fade-in gap-2",
                msg.role === "user" ? "flex-row-reverse" : "",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user"
                    ? "bg-brand/20 text-brand"
                    : "bg-warm-100 text-muted",
                )}
              >
                {msg.role === "user" ? (
                  <IconUser size={14} />
                ) : (
                  <IconRobot size={14} />
                )}
              </span>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-brand text-white"
                    : "border border-warm-200 bg-surface text-foreground",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="py-1">
              <LoadingState message="Chefie is thinking…" />
            </div>
          )}
        </div>

        <StepAssistantVoiceBar
          step={step}
          enabled={open}
          loading={loading}
          onChatMessage={appendMessage}
          onNavigate={handleNavigation}
          onControlsReady={(controls) => {
            voiceControlsRef.current = controls;
          }}
        />

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-warm-200 bg-background p-4 sm:p-5"
        >
          <div className="flex gap-2">
            <input
              className="input min-w-0 flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about this step…"
              disabled={loading}
              aria-label="Message to step assistant"
            />
            <button
              type="submit"
              className="btn-primary shrink-0 px-3"
              disabled={loading || !text.trim()}
              aria-label="Send message"
            >
              <IconSend size={20} />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Voice uses your step agent (like /voice). Interrupt anytime — say
            &quot;next&quot; only to continue.
          </p>
        </form>
      </article>
    </div>
  );
}
