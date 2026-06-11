"use client";

import Link from "next/link";
import {
  IconClock,
  IconEye,
  IconLeaf,
  IconMeat,
  IconTrash,
} from "@tabler/icons-react";
import type { MealPlanEntry } from "@/types/meal-plan";

interface PlanMealRowProps {
  plan: MealPlanEntry;
  onRemove?: (planId: number) => void;
  removing?: boolean;
}

export function PlanMealRow({ plan, onRemove, removing }: PlanMealRowProps) {
  const isVeg = plan.dishType === "Veg";

  return (
    <article className="card p-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="chip-active text-xs">{plan.mealType}</span>
            <span className="chip text-xs">{plan.cuisineName}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isVeg ? "badge-fresh" : "badge-category"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-error-light hover:text-error disabled:opacity-50"
              aria-label={`Remove ${plan.dishName}`}
            >
              <IconTrash size={18} />
            </button>
          )}
        </div>
        <h3 className="font-semibold text-foreground">{plan.dishName}</h3>
        <p className="text-xs text-muted line-clamp-2">{plan.description}</p>

        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <IconClock size={14} className="text-brand" />
            Prep {plan.prepTime}m · Cook {plan.cookingTime}m
          </span>
        </p>

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
