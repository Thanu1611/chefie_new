import { Suspense } from "react";
import { IconRobot } from "@tabler/icons-react";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { LoadingState } from "@/components/ui/LoadingState";

export default function VoicePage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <IconRobot className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Voice Cooking Assistant</h1>
        <p className="mt-2 text-muted">
          Ask Chefie about substitutions, timing, mistakes, and cooking tips — by
          voice or text.
        </p>
      </header>
      <Suspense fallback={<LoadingState message="Loading voice assistant..." />}>
        <VoiceAssistant />
      </Suspense>
    </section>
  );
}
