"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconClock,
  IconChefHat,
  IconBookmarkPlus,
} from "@tabler/icons-react";
import { GenerateIcon } from "@/components/icons/GenerateIcon";
import { CUISINES, DEFAULT_CUISINE } from "@/lib/constants";
import type { Cuisine, GeneratedRecipe } from "@/types/recipe";
import type { GeminiErrorCode } from "@/lib/gemini/errors";
import { DishImage } from "@/components/dishes/DishImage";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

type GenerateError = {
  title: string;
  message: string;
  code?: GeminiErrorCode;
  retryable: boolean;
};

type AddStatus = "idle" | "loading" | "success" | "duplicate" | "error";

export default function GeneratePage() {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine>(DEFAULT_CUISINE);
  const [result, setResult] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GenerateError | null>(null);
  const [addStatus, setAddStatus] = useState<AddStatus>("idle");
  const [addMessage, setAddMessage] = useState("");
  const [savedDishId, setSavedDishId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAddStatus("idle");
    setAddMessage("");
    setSavedDishId(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, cuisine }),
      });

      let data: {
        recipe?: GeneratedRecipe;
        error?: string;
        title?: string;
        code?: GeminiErrorCode;
        retryable?: boolean;
      } = {};

      try {
        data = await res.json();
      } catch {
        throw {
          title: "Unexpected response",
          message: "The server returned an invalid response. Please try again.",
          retryable: true,
        } satisfies GenerateError;
      }

      if (!res.ok) {
        setError({
          title: data.title ?? "Could not generate recipe",
          message: data.error ?? "Something went wrong. Please try again.",
          code: data.code,
          retryable: data.retryable !== false,
        });
        return;
      }

      if (!data.recipe) {
        setError({
          title: "No recipe returned",
          message: "The AI did not return a recipe. Please try again.",
          retryable: true,
        });
        return;
      }

      setResult(data.recipe);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError(err as GenerateError);
      } else {
        setError({
          title: "Something went wrong",
          message:
            err instanceof Error
              ? err.message
              : "We couldn't generate your recipe. Check your connection and try again.",
          retryable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRecipes = async () => {
    if (!result || addStatus === "loading" || addStatus === "success") return;

    setAddStatus("loading");
    setAddMessage("");

    try {
      const res = await fetch("/api/dishes/add-generated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: result }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setAddStatus("success");
        setAddMessage(data.message ?? "Recipe added successfully.");
        setSavedDishId(data.dishId ?? null);
        return;
      }

      if (data.status === "duplicate") {
        setAddStatus("duplicate");
        setAddMessage(
          data.message ??
            "This recipe already exists in your predefined dishes.",
        );
        return;
      }

      setAddStatus("error");
      setAddMessage(data.message ?? data.error ?? "Could not save recipe.");
    } catch {
      setAddStatus("error");
      setAddMessage("Could not save recipe. Please try again.");
    }
  };

  const showBrowseCuisines =
    error?.code === "QUOTA_EXCEEDED" ||
    error?.code === "NOT_CONFIGURED" ||
    error?.code === "INVALID_API_KEY";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <GenerateIcon className="h-7 w-7 text-brand" stroke={1.75} />
        </span>
        <h1 className="text-3xl font-bold text-foreground">AI Recipe Generator</h1>
        <p className="mt-2 text-muted">
          Enter what you have in your kitchen and AI will suggest a custom recipe
          with a unique AI-generated food photo.
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
            disabled={loading}
          />
        </label>

        <fieldset className="space-y-2" disabled={loading}>
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
          <GenerateIcon size={18} stroke={1.75} />
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      {loading && (
        <LoadingState message="Crafting your recipe and finding a matching dish photo…" />
      )}

      {error && (
        <ErrorState
          title={error.title}
          message={error.message}
          onRetry={error.retryable ? () => setError(null) : undefined}
          retryLabel="Try again"
          secondaryAction={
            showBrowseCuisines
              ? { href: "/cuisines", label: "Browse predefined dishes" }
              : undefined
          }
        />
      )}

      {result && (
        <article className="card overflow-hidden">
          <div className="relative aspect-[16/10] w-full bg-warm-100">
            <DishImage
              src={result.image_url}
              alt={result.dish_name}
              sizes="(max-width: 768px) 100vw, 42rem"
              priority
            />
          </div>
          <div className="space-y-5 p-6">
          <header>
            <h2 className="text-2xl font-bold text-foreground">{result.dish_name}</h2>
            {result.image_ai_generated ? (
              <p className="mt-1 text-xs font-medium text-brand">
                AI-generated dish photo
              </p>
            ) : result.image_matched_online ? (
              <p className="mt-1 text-xs font-medium text-brand">
                Photo matched to your recipe
              </p>
            ) : null}
            <p className="mt-1 text-sm text-muted">{result.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
              {result.difficulty && (
                <span className="inline-flex items-center gap-1 capitalize">
                  <IconChefHat size={16} className="text-brand" />
                  {result.difficulty}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <IconClock size={16} className="text-brand" />
                {result.prep_time + result.cooking_time} min total
              </span>
              <span className="rounded-full bg-warm-100 px-2 py-0.5 text-xs">
                {result.meal_type} · {result.dish_type}
              </span>
            </div>
          </header>

          <section>
            <h3 className="mb-2 font-semibold">Ingredients</h3>
            <ul className="space-y-1 text-sm">
              {result.ingredients.map((ing) => (
                <li key={`${ing.ingredient_name}-${ing.display_text}`}>
                  {ing.display_text}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">Steps</h3>
            <ol className="space-y-3 text-sm">
              {[...result.steps]
                .sort((a, b) => a.step_number - b.step_number)
                .map((step) => (
                  <li key={step.step_number} className="flex gap-2">
                    <span className="font-bold text-brand">{step.step_number}.</span>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-muted">{step.instruction}</p>
                      {step.timer_required && step.timer_minutes != null && (
                        <p className="mt-1 text-xs text-brand">
                          Timer: {step.timer_minutes} min
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          </section>

          <div className="space-y-3 border-t border-warm-200 pt-4">
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={addStatus === "loading" || addStatus === "success"}
              onClick={handleAddToRecipes}
            >
              <IconBookmarkPlus size={18} />
              {addStatus === "loading"
                ? "Adding to recipes…"
                : addStatus === "success"
                  ? "Added to recipes"
                  : "Add to Recipes"}
            </button>

            {addMessage && (
              <p
                className={`text-center text-sm ${
                  addStatus === "success"
                    ? "text-secondary-dark"
                    : addStatus === "duplicate"
                      ? "text-warning-dark"
                      : addStatus === "error"
                        ? "text-error"
                        : "text-muted"
                }`}
              >
                {addMessage}
              </p>
            )}

            {savedDishId && addStatus === "success" && (
              <p className="text-center text-sm">
                <Link
                  href={`/dishes/${savedDishId}`}
                  className="font-medium text-brand underline"
                >
                  View dish in cuisines
                </Link>
              </p>
            )}
          </div>
          </div>
        </article>
      )}
    </div>
  );
}
