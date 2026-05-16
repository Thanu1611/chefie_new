"use client";

import { useMemo } from "react";
import { IconListDetails } from "@tabler/icons-react";
import { useDishServing } from "@/components/dishes/DishServingContext";
import { getScaleFactor, scaleIngredients } from "@/lib/dishes/ingredient-scaling";
import type { DishIngredient } from "@/types/dish-ingredient";

interface DishDetailIngredientsProps {
  ingredients: DishIngredient[];
}

export function DishDetailIngredients({ ingredients }: DishDetailIngredientsProps) {
  const { selectedServings, baseServings } = useDishServing();

  const scaled = useMemo(() => {
    const factor = getScaleFactor(selectedServings, baseServings);
    return scaleIngredients(ingredients, factor);
  }, [ingredients, selectedServings, baseServings]);

  if (ingredients.length === 0) return null;

  return (
    <section className="card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <IconListDetails size={22} className="text-brand" />
        Ingredients
      </h2>
      <ul className="space-y-2">
        {scaled.map((item) => (
          <li
            key={`${item.ingredientName}-${item.displayText}`}
            className="rounded-xl bg-warm-50 px-3 py-2 text-sm text-foreground"
          >
            {item.displayText}
          </li>
        ))}
      </ul>
    </section>
  );
}
