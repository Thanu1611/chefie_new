import Image from "next/image";
import Link from "next/link";
import {
  IconClock,
  IconFlame,
  IconLeaf,
  IconArrowRight,
} from "@tabler/icons-react";
import type { Recipe } from "@/types/recipe";
import { SPICY_LABELS } from "@/lib/constants";

interface RecipeCardProps {
  recipe: Recipe;
}

function cuisineLabel(cuisine: Recipe["cuisine"]) {
  if (cuisine === "sri-lankan") return "Sri Lankan";
  return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="card-hover overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-warm-100">
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {recipe.isVegetarian && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-green-700 shadow-sm">
            <IconLeaf size={14} />
            Veg
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            {cuisineLabel(recipe.cuisine)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground line-clamp-2">
            {recipe.name}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <IconClock size={16} />
            {recipe.cookingTimeMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            {recipe.difficulty}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconFlame size={16} />
            {SPICY_LABELS[recipe.spicyLevel]}
          </span>
        </div>
        <Link href={`/recipes/${recipe.id}`} className="btn-secondary w-full justify-center">
          View Recipe
          <IconArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}
