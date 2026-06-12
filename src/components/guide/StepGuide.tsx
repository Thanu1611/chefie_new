"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StepAssistantPanel } from "@/components/guide/StepAssistantPanel";
import { cn } from "@/lib/utils/cn";
import type { StepAssistantContext } from "@/types/step-assistant";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChefHat,
  IconMicrophone,
  IconRefresh,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react";
import { useStepTimer } from "@/hooks/useStepTimer";
import type { DishStep, DishWithSteps } from "@/types/dish";
import { StepTimer } from "./StepTimer";

interface StepGuideProps {
  dish: DishWithSteps;
}

export function StepGuide({ dish }: StepGuideProps) {
  const { user, loading: authLoading } = useAuth();
  const canUseAssistant = Boolean(user);
  const steps = [...dish.steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [repeatKey, setRepeatKey] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const done = currentStepIndex >= steps.length;
  const step: DishStep | undefined = steps[currentStepIndex];

  const stepContext = useMemo((): StepAssistantContext => {
    const current = steps[currentStepIndex];
    return {
      dish_name: dish.dishName,
      step_number: current?.stepNumber ?? 1,
      step_title: current?.title ?? "",
      instruction: current?.instruction ?? "",
      timer_minutes:
        current?.timerRequired && current.timerMinutes != null
          ? current.timerMinutes
          : null,
      break_time_minutes: current?.breakTimeMinutes ?? 0,
    };
  }, [steps, currentStepIndex, dish.dishName]);

  const goToNextStep = useCallback(() => {
    setCurrentStepIndex((i) => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
    setRepeatKey((k) => k + 1);
  }, [steps.length]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
    setRepeatKey((k) => k + 1);
  }, []);

  const timerMinutes =
    step?.timerRequired && step.timerMinutes != null && step.timerMinutes > 0
      ? step.timerMinutes
      : null;
  const stepTimer = useStepTimer(done ? null : timerMinutes, repeatKey);

  if (done) {
    return (
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/15">
          <IconCircleCheck className="h-12 w-12 text-brand" stroke={1.5} />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Your meal is ready!</h1>
        <p className="max-w-md text-muted">
          You finished cooking {dish.dishName}. Enjoy your delicious meal!
        </p>
        <Link href={`/dishes/${dish.dishId}`} className="btn-primary">
          Back to dish
        </Link>
      </section>
    );
  }

  if (!step) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        <span>{dish.dishName}</span>
      </div>

      <article className="card space-y-3 p-6 md:p-8" key={`${currentStepIndex}-${repeatKey}`}>
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        <p className="text-lg leading-relaxed text-muted md:text-xl">
          {step.instruction}
        </p>
        {step.breakTimeMinutes > 0 && (
          <p className="inline-flex items-center gap-1 text-sm text-brand">
            <IconClock size={16} />
            Break: {step.breakTimeMinutes} min before next step
          </p>
        )}
      </article>

      {!assistantOpen ? <StepTimer timer={stepTimer} variant="full" /> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
          className="btn-secondary flex-1 disabled:opacity-40"
        >
          <IconArrowLeft size={18} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => setRepeatKey((k) => k + 1)}
          className="btn-secondary"
        >
          <IconRefresh size={18} />
          Repeat step
        </button>
        {canUseAssistant ? (
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            disabled={authLoading}
            className="btn-secondary"
          >
            <IconMicrophone size={18} />
            Ask assistant
          </button>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent(`/guide/${dish.dishId}`)}&reason=step-assistant`}
            className={cn(
              "btn-secondary pointer-events-auto opacity-50",
              authLoading && "pointer-events-none",
            )}
            title="Log in to use the step assistant"
            aria-disabled={!authLoading}
          >
            <IconMicrophone size={18} />
            Ask assistant
          </Link>
        )}
        <button
          type="button"
          onClick={goToNextStep}
          className="btn-primary flex-1"
        >
          Next
          <IconArrowRight size={18} />
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
        <IconChefHat size={14} />
        Take your time — great cooking is never rushed.
      </p>

      {canUseAssistant && (
        <StepAssistantPanel
          open={assistantOpen}
          step={stepContext}
          timer={stepTimer}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          isLastStep={currentStepIndex >= steps.length - 1}
          canGoPrevious={currentStepIndex > 0}
          onGoNext={goToNextStep}
          onGoPrevious={goToPreviousStep}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </section>
  );
}
