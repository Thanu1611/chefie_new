"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ConversationProvider,
  useConversation,
  useConversationControls,
  useConversationInput,
  useConversationStatus,
} from "@elevenlabs/react";
import {
  IconAlertCircle,
  IconMicrophone,
  IconMicrophoneOff,
  IconRobot,
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function VoiceAssistantInner() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("recipe");
  const { startSession, endSession } = useConversationControls();
  const { status, message: statusMessage } = useConversationStatus();
  const { sendUserMessage, isSpeaking, isListening } = useConversation();
  const { isMuted, setMuted } = useConversationInput();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connecting, setConnecting] = useState(false);

  const connected = status === "connected";
  const hasError = status === "error";

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
        addMessage(
          "assistant",
          "Hi! I'm Chefie. Ask me about cooking steps, substitutions, or fixing mistakes.",
        );
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
    [addMessage],
  );

  const handleConnect = async () => {
    if (connected) {
      endSession();
      return;
    }

    setConnecting(true);

    try {
      const res = await fetch("/api/elevenlabs/session");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to prepare voice session");
      }

      startSession({
        connectionType: "websocket",
        ...(data.signedUrl ? { signedUrl: data.signedUrl as string } : {}),
        connectionDelay: { default: 300 },
        ...sessionCallbacks(),
        ...(recipeId
          ? {
              dynamicVariables: { recipe_id: recipeId },
            }
          : {}),
      });
    } catch (err) {
      setConnecting(false);
      const msg =
        err instanceof Error ? err.message : "Failed to start voice session";
      addMessage("assistant", msg);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage("user", text.trim());
    if (connected) {
      sendUserMessage(text.trim());
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
          ? "Chefie is speaking..."
          : isListening
            ? "Listening..."
            : "Voice session active"
        : "Tap to start voice cooking assistant";

  return (
    <section className="space-y-6">
      {(hasError || statusMessage) && !connected && (
        <section className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <IconAlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{statusMessage ?? "Voice connection failed. See messages below."}</p>
        </section>
      )}

      <section className="card flex flex-col items-center gap-4 p-6 text-center">
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className={`flex h-24 w-24 items-center justify-center rounded-full transition-all disabled:opacity-60 ${
            connected
              ? "bg-brand text-white shadow-lg shadow-brand/30 animate-pulse-soft"
              : "bg-brand/15 text-brand hover:bg-brand hover:text-white"
          }`}
          aria-label={connected ? "End voice session" : "Start voice session"}
        >
          {connected ? (
            <IconMicrophoneOff size={40} stroke={1.5} />
          ) : (
            <IconMicrophone size={40} stroke={1.5} />
          )}
        </button>
        <p className="text-sm font-medium text-foreground">{statusLabel}</p>
        <p className="text-xs text-muted">
          Uses your microphone. Ask about substitutions, timing, and techniques.
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
            Your conversation will appear here. Try asking &quot;How do I fix salty
            curry?&quot;
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
      </section>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a cooking question..."
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

export function VoiceAssistant() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_KEY?.trim();

  if (!agentId) {
    return <VoiceAssistantFallback />;
  }

  return (
    <ConversationProvider agentId={agentId}>
      <VoiceAssistantInner />
    </ConversationProvider>
  );
}

function VoiceAssistantFallback() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ topic: "missing-ingredient" }),
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
          text: "I'm here to help! Describe what went wrong and we'll fix it together.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        ElevenLabs agent ID not configured. Set{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_ELEVENLABS_AGENT_KEY</code>{" "}
        in .env to enable voice.
      </p>
      <section className="card min-h-[200px] p-4">
        {loading && <LoadingState message="Chefie is thinking..." />}
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="text-sm">
              <strong>{msg.role === "user" ? "You: " : "Chefie: "}</strong>
              {msg.text}
            </li>
          ))}
        </ul>
      </section>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a cooking question..."
        />
        <button type="submit" className="btn-primary">
          <IconSend size={18} />
        </button>
      </form>
    </section>
  );
}
