import { Suspense } from "react";
import { IconRobot } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { LoadingState } from "@/components/ui/LoadingState";
import { getDishIngredientsByDishId } from "@/lib/dishes/get-dish-ingredients";
import { getDishById } from "@/lib/db/queries";
import { buildDishVoiceContext } from "@/lib/voice/dish-context";

interface PageProps {
  searchParams: Promise<{ dishId?: string; dish?: string; recipe?: string }>;
}

export default async function VoicePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dishId = params.dishId ?? params.dish ?? params.recipe ?? null;

  const dish = dishId ? await getDishById(dishId) : null;
  if (dishId && !dish) notFound();

  const ingredientLines = dish
    ? (await getDishIngredientsByDishId(dish.dishId, dish.dishName)).map(
        (ing) => ing.displayText,
      )
    : undefined;

  const dishContext = dish
    ? buildDishVoiceContext(dish, ingredientLines)
    : null;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <IconRobot className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-bold text-foreground">
          {dish ? `Cooking: ${dish.dishName}` : "Voice Cooking Assistant"}
        </h1>
        <p className="mt-2 text-muted">
          {dish
            ? "Ask about this recipe only — steps, timers, substitutions, and fixes."
            : "Ask about substitutions, timing, mistakes, and cooking tips — by voice or text."}
        </p>
      </header>
      <Suspense fallback={<LoadingState message="Loading voice assistant..." />}>
        <VoiceAssistant dish={dish} dishContext={dishContext} />
      </Suspense>
    </section>
  );
}
