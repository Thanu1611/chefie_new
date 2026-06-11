"use client";

import { useEffect, useState } from "react";

export type NetworkStatus = "good" | "mid" | "bad";

type NetworkInformation = {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

const PING_URL = "/favicon.ico";
const PING_TIMEOUT_MS = 6000;
const CHECK_INTERVAL_MS = 8000;

function worseStatus(a: NetworkStatus, b: NetworkStatus): NetworkStatus {
  const rank: Record<NetworkStatus, number> = { good: 0, mid: 1, bad: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function readConnectionHint(): NetworkStatus | null {
  if (typeof navigator === "undefined" || !navigator.onLine) return "bad";

  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;

  if (!connection?.effectiveType) return null;

  const { effectiveType, downlink = 0, rtt = 0 } = connection;

  if (
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    rtt > 500 ||
    downlink < 0.3
  ) {
    return "bad";
  }

  if (effectiveType === "3g" || rtt > 200 || downlink < 1.2) {
    return "mid";
  }

  return "good";
}

async function measureLatency(): Promise<NetworkStatus> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "bad";
  }

  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    await fetch(`${PING_URL}?ping=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    const ms = performance.now() - start;
    if (ms < 350) return "good";
    if (ms < 1500) return "mid";
    return "bad";
  } catch {
    return "bad";
  }
}

async function resolveNetworkStatus(): Promise<NetworkStatus> {
  const hint = readConnectionHint();
  const latency = await measureLatency();
  return hint ? worseStatus(hint, latency) : latency;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>("mid");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const next = await resolveNetworkStatus();
      if (active) setStatus(next);
    };

    void run();

    const onStatusEvent = () => void run();
    window.addEventListener("online", onStatusEvent);
    window.addEventListener("offline", onStatusEvent);
    window.addEventListener("focus", onStatusEvent);
    document.addEventListener("visibilitychange", onStatusEvent);

    const connection = (navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    connection?.addEventListener?.("change", onStatusEvent);

    const intervalId = window.setInterval(() => void run(), CHECK_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("online", onStatusEvent);
      window.removeEventListener("offline", onStatusEvent);
      window.removeEventListener("focus", onStatusEvent);
      document.removeEventListener("visibilitychange", onStatusEvent);
      connection?.removeEventListener?.("change", onStatusEvent);
    };
  }, []);

  return status;
}

export function networkStatusLabel(status: NetworkStatus): string {
  switch (status) {
    case "good":
      return "Good connection";
    case "mid":
      return "Moderate connection";
    case "bad":
      return "Poor or no connection";
  }
}

export function profileAvatarStatusClass(status: NetworkStatus): string {
  switch (status) {
    case "good":
      return "profile-avatar-good";
    case "mid":
      return "profile-avatar-mid";
    case "bad":
      return "profile-avatar-bad";
  }
}
