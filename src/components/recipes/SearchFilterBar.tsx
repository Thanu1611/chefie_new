"use client";

import {
  IconAdjustments,
  IconClock,
  IconFlame,
  IconLeaf,
  IconMeat,
  IconSearch,
} from "@tabler/icons-react";
import type { Cuisine, SpicyLevel } from "@/types/recipe";
import { SPICY_LABELS } from "@/lib/constants";

export interface FilterState {
  search: string;
  vegetarian: boolean;
  nonVegetarian: boolean;
  spicyLevel: SpicyLevel | "";
  maxCookingTime: number | "";
}

interface SearchFilterBarProps {
  filters: FilterState;
  cuisine?: Cuisine;
  onChange: (filters: FilterState) => void;
}

export function SearchFilterBar({
  filters,
  cuisine,
  onChange,
}: SearchFilterBarProps) {
  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={20}
        />
        <input
          type="search"
          placeholder="Search recipes..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="input pl-10"
        />
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <IconAdjustments size={18} className="text-brand" />
        Filters
        {cuisine && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs capitalize text-brand-dark">
            {cuisine.replace("-", " ")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            update({ vegetarian: !filters.vegetarian, nonVegetarian: false })
          }
          className={filters.vegetarian ? "chip-active" : "chip"}
        >
          <IconLeaf size={16} /> Vegetarian
        </button>
        <button
          type="button"
          onClick={() =>
            update({
              nonVegetarian: !filters.nonVegetarian,
              vegetarian: false,
            })
          }
          className={filters.nonVegetarian ? "chip-active" : "chip"}
        >
          <IconMeat size={16} /> Non-veg
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-1 font-medium text-muted">
            <IconFlame size={16} /> Spicy level
          </span>
          <select
            value={filters.spicyLevel}
            onChange={(e) =>
              update({
                spicyLevel:
                  e.target.value === ""
                    ? ""
                    : (Number(e.target.value) as SpicyLevel),
              })
            }
            className="input"
          >
            <option value="">Any</option>
            {SPICY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-1 font-medium text-muted">
            <IconClock size={16} /> Max time (min)
          </span>
          <select
            value={filters.maxCookingTime}
            onChange={(e) =>
              update({
                maxCookingTime:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className="input"
          >
            <option value="">Any</option>
            <option value={30}>Under 30 min</option>
            <option value={45}>Under 45 min</option>
            <option value={60}>Under 60 min</option>
          </select>
        </label>
      </div>
    </div>
  );
}

