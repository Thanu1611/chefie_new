"use client";

import { useState } from "react";
import {
  IconDroplet,
  IconFlame,
  IconHelp,
  IconSalt,
  IconShoppingBag,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";

const TOPICS = [
  { id: "too-salty", label: "Too salty", icon: IconSalt },
  { id: "too-spicy", label: "Too spicy", icon: IconFlame },
  { id: "burnt-food", label: "Burnt food", icon: IconFlame },
  { id: "watery-curry", label: "Watery curry", icon: IconDroplet },
  { id: "missing-ingredient", label: "Missing ingredient", icon: IconShoppingBag },
] as const;

export default function HelpPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [fix, setFix] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFix = async (topic: string) => {
    setSelected(topic);
    setLoading(true);
    setFix(null);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setFix(data.fix ?? "Try tasting and adjusting gradually.");
    } catch {
      setFix("Could not load fix. Add a little acid or dairy to balance flavors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <IconHelp className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Help Portal</h1>
        <p className="mt-2 text-muted">
          Quick AI cooking fixes for common kitchen emergencies.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => fetchFix(id)}
            className={selected === id ? "chip-active w-full justify-start p-4" : "chip w-full justify-start p-4"}
          >
            <Icon size={20} className="text-brand" />
            {label}
          </button>
        ))}
      </div>

      {loading && <LoadingState message="Finding a fix..." />}

      {fix && !loading && (
        <article className="card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Chefie&apos;s fix
          </h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {fix}
          </div>
        </article>
      )}
    </div>
  );
}
