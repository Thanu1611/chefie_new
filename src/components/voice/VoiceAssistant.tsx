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
  IconAlertCircle,
  IconRobot,
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { VoiceMicButton, type VoiceMicMode } from "@/components/voice/VoiceMicButton";
import { useAgentVisualizer } from "@/hooks/useAgentVisualizer";
import { useMicVisualizer } from "@/hooks/useMicVisualizer";
import { buildElevenLabsDishDynamicVariables } from "@/lib/voice/elevenlabs-dish-variables";
import {
  elevenLabsAgentEnvName,
  resolveElevenLabsAgentId,
  type ElevenLabsAgentVariant,
} from "@/lib/voice/elevenlabs-agents";
import type { DishWithSteps } from "@/types/dish";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface VoiceAssistantProps {
  dish?: DishWithSteps | null;
  dishContext?: string | null;
}

interface VoiceAssistantInnerProps extends VoiceAssistantProps {
  agentVariant: ElevenLabsAgentVariant;
}

function VoiceAssistantInner({
  dish,
  dishContext,
  agentVariant,
}: VoiceAssistantInnerProps) {
  const { startSession, endSession } = useConversationControls();
  const { status, message: statusMessage } = useConversationStatus();
  const { sendUserMessage, isSpeaking, isListening } = useConversation();
  const { isMuted, setMuted } = useConversationInput();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSpeaking]);

  const connected = status === "connected";
  const hasError = status === "error";
  const dishMode = Boolean(dish && dishContext);

  const micActive = connected && isListening && !isMuted;
  const agentActive = connected && isSpeaking && !isListening;
  const { levels: micLevels, averageLevel: micAvg } = useMicVisualizer(micActive);
  const { levels: agentLevels, averageLevel: agentAvg } =
    useAgentVisualizer(agentActive);

  const addMessage = useCallback((role: Message["role"], text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === role && last.text === trimmed) return prev;
      return [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, role, text: trimmed },
      ];
    });
  }, []);

  const sessionCallbacks = useCallback(
    () => ({
      onConnect: () => {
        setConnecting(false);
        // addMessage(
        //   "assistant",
        //   dishMode
        //     ? `வணக்கம்! ${dish!.dishName} செய்வதற்கு நான் உங்களுக்கு உதவ தயாராக இருக்கிறேன் 😊  
        // இந்த dish-க்கு தொடர்பான step, timer, அல்லது ingredient substitution பற்றி எதுவும் கேளுங்கள்.`
        //     : "வணக்கம்! 😊 சமையல் steps, ingredient substitutions, அல்லது cooking mistakes fix செய்வது பற்றி என்னிடம் கேளுங்கள்.",
        // );
      },
      onDisconnect: () => setConnecting(false),
      onError: (msg: string) => {
        setConnecting(false);
        const hint =
          msg.toLowerCase().includes("negotiation") ||
          msg.toLowerCase().includes("rtc")
            ? " Try again, or use text input below. If this persists, check firewall/VPN settings."
            : "";
        addMessage("assistant", `Could not connect: ${msg}${hint}`);
      },
      onMessage: (props: { message: string; role?: "user" | "agent"; source?: "user" | "ai" }) => {
        const role =
          props.role === "user" || props.source === "user" ? "user" : "assistant";
        addMessage(role, props.message);
      },
      onAgentChatResponsePart: (part: { text?: string }) => {
        if (part.text) addMessage("assistant", part.text);
      },
    }),
    [addMessage, dish, dishMode],
  );

  const handleConnect = async () => {
    if (connected) {
      endSession();
      return;
    }

    setConnecting(true);

    try {
      const res = await fetch(
        `/api/elevenlabs/session?variant=${agentVariant}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to prepare voice session");
      }

      const dynamicVariables =
        dish != null ? buildElevenLabsDishDynamicVariables(dish) : {};

      startSession({
        connectionType: "websocket",
        ...(data.signedUrl ? { signedUrl: data.signedUrl as string } : {}),
        connectionDelay: { default: 300 },
        ...sessionCallbacks(),
        ...(Object.keys(dynamicVariables).length > 0 ? { dynamicVariables } : {}),
      });
    } catch (err) {
      setConnecting(false);
      const msg =
        err instanceof Error ? err.message : "Failed to start voice session";
      addMessage("assistant", msg);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const question = text.trim();
    addMessage("user", question);
    if (connected) {
      sendUserMessage(question);
    } else if (dishContext) {
      setConnecting(true);
      try {
        const res = await fetch("/api/help", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            dishContext,
            dishId: dish?.dishId,
          }),
        });
        const data = await res.json();
        addMessage(
          "assistant",
          data.fix ?? "I can only help with this dish once connected or configured.",
        );
      } catch {
        addMessage(
          "assistant",
          "Tap the microphone to start a voice session for this dish.",
        );
      } finally {
        setConnecting(false);
      }
    } else {
      addMessage(
        "assistant",
        "Tap the microphone to start a voice session, or check your ElevenLabs agent configuration.",
      );
    }
    setText("");
  };

  const statusLabel = connecting
    ? "Connecting..."
    : hasError
      ? statusMessage ?? "Connection error"
      : connected
        ? isSpeaking
          ? "Assistant is speaking..."
          : isListening
            ? "Listening..."
            : dishMode
              ? `Guiding you through ${dish!.dishName}`
              : "Voice session active"
        : dishMode
          ? `Tap to start — ${dish!.dishName} only`
          : "Tap to start voice cooking assistant";

  const placeholder = dishMode
    ? `Ask about ${dish!.dishName} (steps, timers, swaps)...`
    : "Type a cooking question...";

  const micMode: VoiceMicMode = connecting
    ? "connecting"
    : connected
      ? isSpeaking
        ? "speaking"
        : isListening
          ? "listening"
          : "idle"
      : "idle";

  return (
    <section className="space-y-6">
      {dishMode && (
        <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-center text-sm text-foreground">
          Dish-specific mode — guidance is limited to{" "}
          <strong>{dish!.dishName}</strong>
        </p>
      )}

      {(hasError || statusMessage) && !connected && (
        <section className="alert-error flex items-start gap-2 p-4">
          <IconAlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{statusMessage ?? "Voice connection failed. See messages below."}</p>
        </section>
      )}

      <section className="card flex flex-col items-center gap-4 p-6 text-center">
        <VoiceMicButton
          mode={micMode}
          connected={connected}
          disabled={connecting}
          onClick={handleConnect}
          barLevels={
            micMode === "listening"
              ? micLevels
              : micMode === "speaking"
                ? agentLevels
                : undefined
          }
          averageLevel={
            micMode === "listening"
              ? micAvg
              : micMode === "speaking"
                ? agentAvg
                : undefined
          }
        />
        <p className="text-sm font-medium text-foreground">{statusLabel}</p>
        <p className="text-xs text-muted">
          {dishMode
            ? "Ask only about this recipe — steps, timers, and substitutions."
            : "Uses your microphone. Ask about substitutions, timing, and techniques."}
        </p>
        {connected && (
          <button
            type="button"
            onClick={() => setMuted(!isMuted)}
            className="text-xs font-medium text-brand underline"
          >
            {isMuted ? "Unmute microphone" : "Mute microphone"}
          </button>
        )}
      </section>

      <section className="card min-h-[280px] max-h-[420px] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            {dishMode
              ? `Ask about step ${1}–${dish!.steps.length}, timers, or ingredient swaps for ${dish!.dishName}.`
              : 'Your conversation will appear here. Try asking "How do I fix salty curry?"'}
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-brand/20 text-brand"
                      : "bg-warm-100 text-muted"
                  }`}
                >
                  {msg.role === "user" ? (
                    <IconUser size={16} />
                  ) : (
                    <IconRobot size={16} />
                  )}
                </span>
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-brand text-white"
                      : "bg-warm-100 text-foreground"
                  }`}
                >
                  {msg.text}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div ref={transcriptEndRef} className="h-px shrink-0" aria-hidden />
      </section>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="submit" className="btn-primary shrink-0">
          <IconSend size={18} />
          Send
        </button>
      </form>
    </section>
  );
}

export function VoiceAssistant({ dish, dishContext }: VoiceAssistantProps) {
  const agentVariant: ElevenLabsAgentVariant = dish != null ? "dish" : "common";
  const agentId = resolveElevenLabsAgentId(dish);

  if (!agentId) {
    return (
      <VoiceAssistantFallback
        dish={dish}
        dishContext={dishContext}
        agentVariant={agentVariant}
      />
    );
  }

  return (
    <ConversationProvider agentId={agentId}>
      <VoiceAssistantInner
        dish={dish}
        dishContext={dishContext}
        agentVariant={agentVariant}
      />
    </ConversationProvider>
  );
}

interface VoiceAssistantFallbackProps extends VoiceAssistantProps {
  agentVariant: ElevenLabsAgentVariant;
}

function VoiceAssistantFallback({
  dish,
  dishContext,
  agentVariant,
}: VoiceAssistantFallbackProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const dishMode = Boolean(dish && dishContext);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const question = text.trim();
    setText("");
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", text: question },
    ]);
    setLoading(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          dishContext
            ? { question, dishContext, dishId: dish?.dishId }
            : { topic: "missing-ingredient", question },
        ),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.fix ?? "Try adjusting seasoning and simmer a few more minutes.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: dishMode
            ? `Describe what went wrong with ${dish!.dishName} and we'll fix it.`
            : "I'm here to help! Describe what went wrong and we'll fix it together.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <p className="alert-warning">
        ElevenLabs agent ID not configured. Set{" "}
        <code className="rounded bg-warning-light px-1">
          {elevenLabsAgentEnvName(agentVariant)}
        </code>{" "}
        in .env to enable voice.
        {dishMode && (
          <>
            {" "}
            Text mode is limited to <strong>{dish!.dishName}</strong>.
          </>
        )}
      </p>
      <section className="card min-h-[200px] max-h-[420px] overflow-y-auto p-4">
        {loading && <LoadingState message="Chefie is thinking..." />}
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="text-sm">
              <strong>{msg.role === "user" ? "You: " : "Chefie: "}</strong>
              {msg.text}
            </li>
          ))}
        </ul>
        <div ref={transcriptEndRef} className="h-px shrink-0" aria-hidden />
      </section>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            dishMode
              ? `Ask about ${dish!.dishName}...`
              : "Ask a cooking question..."
          }
        />
        <button type="submit" className="btn-primary">
          <IconSend size={18} />
        </button>
      </form>
    </section>
  );
}
