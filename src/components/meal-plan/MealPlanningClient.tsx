"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconShoppingCart,
  IconX,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { PlanMealRow } from "@/components/meal-plan/PlanMealRow";
import { ShoppingListPreviewModal } from "@/components/meal-plan/ShoppingListPreviewModal";
import {
  addMonths,
  daysInMonthGrid,
  endOfMonth,
  formatDisplayDate,
  formatMonthYear,
  isPastDateKey,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from "@/lib/meal-plan/dates";
import { cn } from "@/lib/utils/cn";
import type { DishSearchResult, GeneratedShoppingLine, MealPlanEntry, PlanAddStatusResult } from "@/types/meal-plan";
import type { DishType, MealType } from "@/types/dish";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
const DIET_FILTERS = ["All", "Veg", "Non-Veg"] as const;

function getFirstAvailableMealType(planned: Set<MealType>): MealType | null {
  return MEAL_TYPES.find((t) => !planned.has(t)) ?? null;
}

export function MealPlanningClient() {
  const todayKey = toDateKey(new Date());
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [plans, setPlans] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addMealType, setAddMealType] = useState<MealType>("Breakfast");
  const [dietFilter, setDietFilter] = useState<(typeof DIET_FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [dishes, setDishes] = useState<DishSearchResult[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [addingDishId, setAddingDishId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopFrom, setShopFrom] = useState(todayKey);
  const [shopTo, setShopTo] = useState(todayKey);
  const [shopItems, setShopItems] = useState<GeneratedShoppingLine[]>([]);
  const [shopPlanCount, setShopPlanCount] = useState(0);
  const [shopGenerated, setShopGenerated] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [shopSuccess, setShopSuccess] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<PlanAddStatusResult | null>(null);
  const [checkingPlanStatus, setCheckingPlanStatus] = useState(false);

  const monthFrom = toDateKey(startOfMonth(viewMonth));
  const monthTo = toDateKey(endOfMonth(viewMonth));

  const loadPlans = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meal-plans?from=${monthFrom}&to=${monthTo}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load meal plans");
      setPlans(data.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load meal plans");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [monthFrom, monthTo]);

  useEffect(() => { void loadPlans(); }, [loadPlans]);

  useEffect(() => {
    if (!selectedDate && !loading) {
      const todayInMonth = todayKey >= monthFrom && todayKey <= monthTo ? todayKey : null;
      setSelectedDate(todayInMonth ?? monthFrom);
    }
  }, [selectedDate, loading, todayKey, monthFrom, monthTo]);

  const plansByDate = useMemo(() => {
    const map = new Map<string, MealPlanEntry[]>();
    for (const p of plans) {
      const list = map.get(p.planDate) ?? [];
      list.push(p);
      map.set(p.planDate, list);
    }
    return map;
  }, [plans]);

  const selectedPlans = useMemo(() => {
    if (!selectedDate) return [];
    return (plansByDate.get(selectedDate) ?? []).sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));
  }, [plansByDate, selectedDate]);

  const plannedMealTypes = useMemo(() => new Set(selectedPlans.map((p) => p.mealType)), [selectedPlans]);

  const searchDishes = useCallback(async () => {
    setDishesLoading(true);
    try {
      const params = new URLSearchParams({ q: search, mealType: addMealType, diet: dietFilter });
      const res = await fetch(`/api/meal-plans/dishes?${params}`);
      const data = await res.json();
      setDishes(data.dishes ?? []);
    } catch {
      setDishes([]);
    } finally {
      setDishesLoading(false);
    }
  }, [search, addMealType, dietFilter]);

  useEffect(() => {
    if (!addOpen) return;
    const t = setTimeout(() => void searchDishes(), 200);
    return () => clearTimeout(t);
  }, [addOpen, addMealType, dietFilter, search, searchDishes]);

  const openAddPanel = () => {
    if (!selectedDate || isPastDateKey(selectedDate, todayKey)) return;
    setSearch("");
    setDietFilter("All");
    const next = getFirstAvailableMealType(plannedMealTypes);
    setAddMealType(next ?? "Breakfast");
    setAddOpen(true);
    void loadPlans({ silent: true });
  };

  const addDish = async (dish: DishSearchResult) => {
    if (!selectedDate) return;
    setAddingDishId(dish.dishId);
    setError(null);
    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planDate: selectedDate, mealType: addMealType, dishId: dish.dishId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add meal");
      if (data.plan) setPlans((prev) => [...prev.filter((p) => !(p.planDate === selectedDate && p.mealType === addMealType)), data.plan]);
      setAddOpen(false);
      const next = getFirstAvailableMealType(new Set([...plannedMealTypes, addMealType]));
      if (next) setAddMealType(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add meal");
    } finally {
      setAddingDishId(null);
    }
  };

  const removePlan = async (planId: number) => {
    setRemovingId(planId);
    try {
      const res = await fetch(`/api/meal-plans?planId=${planId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove");
      setPlans((prev) => prev.filter((p) => p.planId !== planId));
    } catch {
      setError("Could not remove meal plan");
    } finally {
      setRemovingId(null);
    }
  };

  const weeks = daysInMonthGrid(viewMonth);
  const allMealsPlanned = plannedMealTypes.size >= 3;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meal Planning</h1>
          <p className="text-sm text-muted">Plan meals and build your shopping list</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-primary" onClick={() => setShopOpen(true)}>
            <IconCalendar size={18} /> Generate list
          </button>
          <Link href="/shopping-list" className="btn-secondary">
            <IconShoppingCart size={18} /> View list
          </Link>
        </div>
      </header>

      {error && <p className="alert-error px-4 py-2">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" className="btn-ghost p-2" onClick={() => setViewMonth(addMonths(viewMonth, -1))} aria-label="Previous month">
              <IconChevronLeft size={20} />
            </button>
            <h2 className="font-semibold">{formatMonthYear(viewMonth)}</h2>
            <button type="button" className="btn-ghost p-2" onClick={() => setViewMonth(addMonths(viewMonth, 1))} aria-label="Next month">
              <IconChevronRight size={20} />
            </button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
            {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
          </div>
          {loading ? (
            <LoadingState message="Loading calendar…" />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {weeks.flat().map((dateKey, i) => {
                if (!dateKey) return <div key={`pad-${i}`} className="aspect-square" />;
                const dayNum = parseDateKey(dateKey).getDate();
                const count = (plansByDate.get(dateKey) ?? []).length;
                const isPast = isPastDateKey(dateKey, todayKey);
                const isSelected = selectedDate === dateKey;
                const cellClass = cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm",
                  isPast && "cursor-not-allowed opacity-40",
                  !isPast && isSelected && "bg-brand text-white",
                  !isPast && !isSelected && "hover:bg-warm-100",
                );
                const dots =
                  count > 0 ? (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                        <span
                          key={j}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            isSelected && !isPast ? "bg-white" : "bg-brand",
                          )}
                        />
                      ))}
                    </span>
                  ) : null;
                if (isPast) {
                  return (
                    <div key={dateKey} aria-disabled className={cellClass}>
                      {dayNum}
                      {dots}
                    </div>
                  );
                }
                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(dateKey)}
                    className={cellClass}
                  >
                    {dayNum}
                    {dots}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="card p-4">
            <h2 className="mb-2 font-semibold">{selectedDate ? formatDisplayDate(selectedDate) : "Select a date"}</h2>
            {loading ? <LoadingState message="Loading…" /> : selectedPlans.length === 0 ? (
              <p className="text-sm text-muted">No meals planned yet.</p>
            ) : (
              <ul className="space-y-3">{selectedPlans.map((p) => <li key={p.planId}><PlanMealRow plan={p} onRemove={removePlan} removing={removingId === p.planId} /></li>)}</ul>
            )}
            <button type="button" className="btn-primary mt-4 w-full" disabled={!selectedDate || isPastDateKey(selectedDate, todayKey) || allMealsPlanned} onClick={openAddPanel}>
              <IconPlus size={18} /> Add meal
            </button>
          </section>
        </aside>
      </div>

      {addOpen && selectedDate && (
        <div
          className="overlay-backdrop p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAddOpen(false);
          }}
        >
          <div
            className="card max-h-[85vh] w-full max-w-lg overflow-y-auto p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-meal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="add-meal-title" className="font-semibold">
                Add {addMealType} — {formatDisplayDate(selectedDate)}
              </h3>
              <button type="button" className="btn-ghost p-2" onClick={() => setAddOpen(false)} aria-label="Close"><IconX size={20} /></button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {MEAL_TYPES.map((t) => (
                <button key={t} type="button" disabled={plannedMealTypes.has(t)} className={cn("chip", addMealType === t && "chip-active", plannedMealTypes.has(t) && "opacity-40")} onClick={() => setAddMealType(t)}>{t}</button>
              ))}
            </div>
            <p className="mb-2 text-xs font-medium text-muted">Diet</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {DIET_FILTERS.map((d) => (
                <button key={d} type="button" className={cn("chip", dietFilter === d && "chip-active")} onClick={() => setDietFilter(d)}>{d}</button>
              ))}
            </div>
            <input className="input mb-3 w-full" placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)} />
            {dishesLoading ? <LoadingState message="Searching…" /> : (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {dishes.map((d) => (
                  <li key={d.dishId}>
                    <button type="button" className="w-full rounded-xl border border-warm-200 p-3 text-left hover:bg-warm-50 disabled:opacity-50" disabled={addingDishId === d.dishId} onClick={() => void addDish(d)}>
                      <span className="font-medium">{d.dishName}</span>
                      <span className="ml-2 text-xs text-muted">{d.cuisineName} · {d.dishType}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ShoppingListPreviewModal
        open={shopOpen}
        fromDate={shopFrom}
        toDate={shopTo}
        onFromDateChange={setShopFrom}
        onToDateChange={setShopTo}
        items={shopItems}
        planCount={shopPlanCount}
        hasGenerated={shopGenerated}
        planStatus={planStatus}
        checkingPlanStatus={checkingPlanStatus}
        loading={shopLoading}
        saving={shopSaving}
        error={shopError}
        success={shopSuccess}
        todayKey={todayKey}
        onClose={() => setShopOpen(false)}
        onGenerate={async () => {
          setShopLoading(true);
          setShopError(null);
          try {
            const res = await fetch("/api/shopping-list/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: shopFrom, to: shopTo }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Generate failed");
            setShopItems(data.items ?? []);
            setShopPlanCount(data.planCount ?? 0);
            setShopGenerated(true);
          } catch (e) {
            setShopError(e instanceof Error ? e.message : "Generate failed");
          } finally {
            setShopLoading(false);
          }
        }}
        onAddToViewList={async () => {
          setShopSaving(true);
          setShopError(null);
          try {
            const res = await fetch("/api/shopping-list/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: shopFrom, to: shopTo }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Save failed");
            setPlanStatus(data.status ?? null);
            setShopSuccess(data.message ?? "Added to view list");
          } catch (e) {
            setShopError(e instanceof Error ? e.message : "Save failed");
          } finally {
            setShopSaving(false);
          }
        }}
      />
    </div>
  );
}
