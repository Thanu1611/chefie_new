import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconBook2,
  IconClock,
  IconFlame,
  IconList,
  IconMicrophone,
  IconUsers,
} from "@tabler/icons-react";
import { getRecipeById } from "@/lib/recipes/queries";
import { RecipeDetailActions } from "./RecipeDetailActions";
import { SPICY_LABELS } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

function cuisineLabel(cuisine: string) {
  if (cuisine === "sri-lankan") return "Sri Lankan";
  return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  return (
    <article className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-warm-100">
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-brand">
            {cuisineLabel(recipe.cuisine)}
          </p>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="text-muted">{recipe.description}</p>
          )}
          <ul className="flex flex-wrap gap-4 text-sm text-muted">
            <li className="inline-flex items-center gap-1">
              <IconClock size={18} className="text-brand" />
              {recipe.cookingTimeMinutes} min
            </li>
            <li className="inline-flex items-center gap-1 capitalize">
              {recipe.difficulty}
            </li>
            <li className="inline-flex items-center gap-1">
              <IconUsers size={18} className="text-brand" />
              {recipe.servings} servings
            </li>
            <li className="inline-flex items-center gap-1">
              <IconFlame size={18} className="text-brand" />
              {SPICY_LABELS[recipe.spicyLevel]}
            </li>
          </ul>

          <RecipeDetailActions recipe={recipe} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/voice?recipe=${recipe.id}`} className="btn-primary flex-1 justify-center">
              <IconMicrophone size={18} />
              Start Voice Cooking
            </Link>
            <Link href={`/guide/${recipe.id}`} className="btn-secondary flex-1 justify-center">
              <IconList size={18} />
              Step-by-Step Guide
            </Link>
          </div>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          Ingredients
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {recipe.ingredients.map((ing) => (
            <li
              key={`${ing.name}-${ing.amount}`}
              className="flex justify-between gap-4 rounded-lg bg-warm-50 px-3 py-2 text-sm"
            >
              <span>{ing.name}</span>
              <span className="font-medium text-muted">{ing.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <IconBook2 className="text-brand" size={22} />
          Preparation
        </h2>
        <ol className="space-y-4">
          {[...recipe.steps]
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {step.order}
                </span>
                <p className="pt-1 text-foreground">{step.instruction}</p>
              </li>
            ))}
        </ol>
      </section>
    </article>
  );
}
