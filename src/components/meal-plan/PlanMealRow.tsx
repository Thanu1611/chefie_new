"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconClock,
  IconEye,
  IconLeaf,
  IconMeat,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { ServingSelector } from "@/components/dishes/ServingSelector";
import { getScaleFactor, scaleMinutes } from "@/lib/dishes/ingredient-scaling";
import type { MealPlanEntry } from "@/types/meal-plan";

interface PlanMealRowProps {
  plan: MealPlanEntry;
  onRemove?: (planId: number) => void;
  onServingsChange?: (planId: number, servings: number) => void;
  removing?: boolean;
  updatingServings?: boolean;
}

export function PlanMealRow({
  plan,
  onRemove,
  onServingsChange,
  removing,
  updatingServings,
}: PlanMealRowProps) {
  const isVeg = plan.dishType === "Veg";
  const [servings, setServings] = useState(plan.servings);
  const baseServings = plan.baseServings > 0 ? plan.baseServings : 2;
  const scaleFactor = getScaleFactor(servings, baseServings);
  const scaledPrep = scaleMinutes(plan.prepTime, scaleFactor);
  const scaledCook = scaleMinutes(plan.cookingTime, scaleFactor);

  useEffect(() => {
    setServings(plan.servings);
  }, [plan.servings]);

  const handleServingsChange = (value: number) => {
    setServings(value);
    onServingsChange?.(plan.planId, value);
  };

  return (
    <article className="card p-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="chip-active text-xs">{plan.mealType}</span>
            <span className="chip text-xs">{plan.cuisineName}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isVeg ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-900"
              }`}
            >
              {isVeg ? <IconLeaf size={12} /> : <IconMeat size={12} />}
              {plan.dishType}
            </span>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(plan.planId)}
              disabled={removing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Remove ${plan.dishName}`}
            >
              <IconTrash size={18} />
            </button>
          )}
        </div>
        <h3 className="font-semibold text-foreground">{plan.dishName}</h3>
        <p className="text-xs text-muted line-clamp-2">{plan.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <IconClock size={14} className="text-brand" />
            Prep {scaledPrep}m · Cook {scaledCook}m
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand-dark">
            <IconUsers size={14} />
            {servings} serving{servings === 1 ? "" : "s"}
          </span>
        </div>

        {onServingsChange && (
          <ServingSelector
            value={servings}
            onChange={handleServingsChange}
            disabled={updatingServings}
            className="w-full justify-center sm:w-auto"
          />
        )}

        <Link
          href={`/recipes/${plan.dishId}`}
          className="btn-primary w-full justify-center text-xs sm:text-sm"
        >
          <IconEye size={16} />
          View dish
        </Link>
      </div>
    </article>
  );
}
