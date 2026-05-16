"use client";

import { useState } from "react";
import {
  IconSparkles,
  IconClock,
  IconChefHat,
} from "@tabler/icons-react";
import { CUISINES } from "@/lib/constants";
import type { Cuisine, GeneratedRecipe } from "@/types/recipe";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GeneratePage() {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine>("chinese");
  const [result, setResult] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, cuisine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <IconSparkles className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-bold text-foreground">AI Recipe Generator</h1>
        <p className="mt-2 text-muted">
          Enter what you have in your kitchen and Chefie will suggest a recipe.
        </p>
      </header>

      <form onSubmit={handleGenerate} className="card space-y-5 p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">
            Available ingredients
          </span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. chicken, coconut milk, curry leaves, rice..."
            className="input min-h-[120px] resize-y"
            required
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">Cuisine</legend>
          <div className="grid grid-cols-3 gap-2">
            {CUISINES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCuisine(c.id)}
                className={cuisine === c.id ? "chip-active justify-center" : "chip justify-center"}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          <IconSparkles size={18} />
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      {loading && <LoadingState message="Chefie is crafting your recipe..." />}
      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {result && (
        <article className="card space-y-5 p-6">
          <header>
            <h2 className="text-2xl font-bold text-foreground">{result.name}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1 capitalize">
                <IconChefHat size={16} className="text-brand" />
                {result.difficulty}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconClock size={16} className="text-brand" />
                {result.cookingTimeMinutes} min
              </span>
            </div>
          </header>

          <section>
            <h3 className="mb-2 font-semibold">Ingredients</h3>
            <ul className="space-y-1 text-sm">
              {result.ingredients.map((ing) => (
                <li key={`${ing.name}-${ing.amount}`}>
                  {ing.amount} {ing.name}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">Steps</h3>
            <ol className="space-y-2 text-sm">
              {[...result.steps]
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <li key={step.order} className="flex gap-2">
                    <span className="font-bold text-brand">{step.order}.</span>
                    {step.instruction}
                  </li>
                ))}
            </ol>
          </section>
        </article>
      )}
    </div>
  );
}
