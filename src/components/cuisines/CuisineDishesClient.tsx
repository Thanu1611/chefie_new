"use client";

import { useMemo, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import { DishCard } from "@/components/dishes/DishCard";
import type { Cuisine, Dish, DishType, MealType } from "@/types/dish";
import { cn } from "@/lib/utils/cn";

const MEALS: MealType[] = ["Breakfast", "Lunch", "Dinner"];
type MealFilter = "All" | MealType;
type DietFilter = "All" | DishType;

const MEAL_OPTIONS: MealFilter[] = ["All", ...MEALS];

interface CuisineDishesClientProps {
  cuisine: Cuisine;
  dishes: Dish[];
}

function dishMatchesSearch(dish: Dish, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    dish.dishName,
    dish.description,
    dish.mealType,
    dish.dishType,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function CuisineDishesClient({ cuisine, dishes }: CuisineDishesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mealFilter, setMealFilter] = useState<MealFilter>("All");
  const [dietFilter, setDietFilter] = useState<DietFilter>("All");

  const filtered = useMemo(() => {
    return dishes.filter((d) => {
      if (!dishMatchesSearch(d, searchQuery)) return false;
      if (mealFilter !== "All" && d.mealType !== mealFilter) return false;
      if (dietFilter === "All") return true;
      return d.dishType === dietFilter;
    });
  }, [dishes, searchQuery, mealFilter, dietFilter]);

  const groups: { type: DishType; label: string; items: Dish[] }[] = [
    { type: "Veg", label: "Vegetarian", items: filtered.filter((d) => d.dishType === "Veg") },
    {
      type: "Non-Veg",
      label: "Non-Vegetarian",
      items: filtered.filter((d) => d.dishType === "Non-Veg"),
    },
  ];

  const visibleGroups =
    dietFilter === "All" ? groups : groups.filter((g) => g.type === dietFilter);

  const hasResults = visibleGroups.some((g) => g.items.length > 0);
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{cuisine.cuisineName}</h1>
        <p className="text-muted">{cuisine.shortDescription}</p>
      </header>

      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dishes..."
          className="input w-full py-2.5 pl-10 pr-10"
          aria-label="Search dishes"
        />
        {hasSearch && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-warm-100 hover:text-brand"
            aria-label="Clear search"
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Meal</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMealFilter(option)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                mealFilter === option
                  ? "bg-brand text-white"
                  : "bg-warm-100 text-muted hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Diet</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["All", "Veg", "Non-Veg"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDietFilter(option)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                dietFilter === option
                  ? "bg-brand text-white"
                  : "bg-warm-100 text-muted hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <p className="rounded-xl border border-warm-200 bg-warm-50 px-4 py-8 text-center text-sm text-muted">
          {hasSearch
            ? "No dishes found for this search."
            : `No ${dietFilter === "All" ? "" : `${dietFilter} `}dishes${
                mealFilter === "All" ? "" : ` for ${mealFilter}`
              } in this cuisine.`}
        </p>
      ) : (
        visibleGroups.map(({ label, items }) =>
          items.length === 0 ? null : (
            <section key={label} className="space-y-4">
              {dietFilter === "All" && (
                <h2 className="text-xl font-semibold text-foreground">{label}</h2>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {items.map((dish) => (
                  <DishCard key={dish.dishId} dish={dish} />
                ))}
              </div>
            </section>
          ),
        )
      )}
    </div>
  );
}
