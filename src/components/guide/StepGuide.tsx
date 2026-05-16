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
} from "@tabler/icons-react";
import type { Recipe } from "@/types/recipe";
import { Timer } from "./Timer";

interface StepGuideProps {
  recipe: Recipe;
}

export function StepGuide({ recipe }: StepGuideProps) {
  const sorted = [...recipe.steps].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [repeatKey, setRepeatKey] = useState(0);
  const done = index >= sorted.length;
  const step = sorted[index];

  if (done) {
    return (
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/15">
          <IconCircleCheck className="h-12 w-12 text-brand" stroke={1.5} />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Your meal is ready!</h1>
        <p className="max-w-md text-muted">
          You finished cooking {recipe.name}. Enjoy your delicious meal!
        </p>
        <Link href={`/recipes/${recipe.id}`} className="btn-primary">
          Back to recipe
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Step {index + 1} of {sorted.length}
        </span>
        <span className="capitalize">{recipe.name}</span>
      </div>

      <article className="card p-6 md:p-8" key={`${index}-${repeatKey}`}>
        <p className="text-lg leading-relaxed text-foreground md:text-xl">
          {step.instruction}
        </p>
      </article>

      {step.timerMinutes != null && step.timerMinutes > 0 && (
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
          Repeat
        </button>
        <Link
          href={`/voice?recipe=${recipe.id}`}
          className="btn-secondary"
        >
          <IconMicrophone size={18} />
          Ask Chefie
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

