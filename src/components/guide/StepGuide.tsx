"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChefHat,
  IconMicrophone,
  IconRefresh,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react";
import type { DishStep, DishWithSteps } from "@/types/dish";
import { Timer } from "./Timer";

interface StepGuideProps {
  dish: DishWithSteps;
}

export function StepGuide({ dish }: StepGuideProps) {
  const steps = [...dish.steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const [index, setIndex] = useState(0);
  const [repeatKey, setRepeatKey] = useState(0);
  const done = index >= steps.length;
  const step: DishStep | undefined = steps[index];

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
          Step {index + 1} of {steps.length}
        </span>
        <span>{dish.dishName}</span>
      </div>

      <article className="card space-y-3 p-6 md:p-8" key={`${index}-${repeatKey}`}>
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

      {step.timerRequired && step.timerMinutes != null && step.timerMinutes > 0 && (
        <Timer key={`timer-${index}-${repeatKey}`} initialMinutes={step.timerMinutes} />
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
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
        <Link href={`/voice?dishId=${dish.dishId}`} className="btn-secondary">
          <IconMicrophone size={18} />
          Ask assistant
        </Link>
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
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
    </section>
  );
}
