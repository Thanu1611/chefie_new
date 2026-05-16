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
import { ServingSelector } from "@/components/dishes/ServingSelector";
import { ShoppingListPreviewModal } from "@/components/meal-plan/ShoppingListPreviewModal";
import {
  addMonths,
  daysInMonthGrid,
  endOfMonth,
  endOfWeek,
  formatDisplayDate,
  formatMonthYear,
  isPastDateKey,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "@/lib/meal-plan/dates";
import { cn } from "@/lib/utils/cn";
import type {
  DishSearchResult,
  GeneratedShoppingLine,
  MealPlanEntry,
  PlanAddStatusResult,
} from "@/types/meal-plan";
import type { MealType } from "@/types/dish";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
const DIET_FILTERS = ["All", "Veg", "Non-Veg"] as const;
type DietFilter = (typeof DIET_FILTERS)[number];

function getPlannedMealTypes(plans: MealPlanEntry[]): Set<MealType> {
  return new Set(plans.map((p) => p.mealType));
}

function getFirstAvailableMealType(planned: Set<MealType>): MealType | null {
  return MEAL_TYPES.find((t) => !planned.has(t)) ?? null;
}

export function MealPlanningClient() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [plans, setPlans] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState<MealType>("Lunch");
  const [dietFilter, setDietFilter] = useState<DietFilter>("All");
  const [search, setSearch] = useState("");
  const [dishResults, setDishResults] = useState<DishSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [previewItems, setPreviewItems] = useState<GeneratedShoppingLine[]>([]);
  const [previewPlanCount, setPreviewPlanCount] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [planStatus, setPlanStatus] = useState<PlanAddStatusResult | null>(null);
  const [checkingPlanStatus, setCheckingPlanStatus] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [previewSuccess, setPreviewSuccess] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addServings, setAddServings] = useState(2);
  const [updatingServingsId, setUpdatingServingsId] = useState<number | null>(null);

  const monthFrom = toDateKey(startOfMonth(viewMonth));
  const monthTo = toDateKey(endOfMonth(viewMonth));
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekFrom = toDateKey(weekStart);
  const weekTo = toDateKey(weekEnd);
  const fetchFrom = monthFrom < weekFrom ? monthFrom : weekFrom;
  const fetchTo = monthTo > weekTo ? monthTo : weekTo;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches && !selectedDate) {
      setSelectedDate(toDateKey(new Date()));
    }
  }, [selectedDate]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/meal-plans?from=${fetchFrom}&to=${fetchTo}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setPlans(data.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load meal plans");
    } finally {
      setLoading(false);
    }
  }, [fetchFrom, fetchTo]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const plansByDate = useMemo(() => {
    const map = new Map<string, MealPlanEntry[]>();
    for (const p of plans) {
      const list = map.get(p.planDate) ?? [];
      list.push(p);
      map.set(p.planDate, list);
    }
    return map;
  }, [plans]);

  const todayKey = toDateKey(new Date());
  const selectedPlans = selectedDate ? (plansByDate.get(selectedDate) ?? []) : [];
  const plannedMealTypes = useMemo(
    () => getPlannedMealTypes(selectedPlans),
    [selectedPlans],
  );
  const allMealsPlanned = plannedMealTypes.size >= MEAL_TYPES.length;
  const selectedIsPast = selectedDate ? isPastDateKey(selectedDate, todayKey) : false;

  const weekDays = useMemo(() => {
    const days: string[] = [];
    const d = new Date(weekStart);
    while (d <= weekEnd) {
      days.push(toDateKey(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [weekStart, weekEnd]);

  useEffect(() => {
    if (!showAdd || allMealsPlanned) return;
    const next = getFirstAvailableMealType(plannedMealTypes);
    if (next && plannedMealTypes.has(mealType)) {
      setMealType(next);
    }
  }, [showAdd, plannedMealTypes, allMealsPlanned, mealType]);

  useEffect(() => {
    if (!showAdd) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ q: search });
        if (mealType) params.set("mealType", mealType);
        if (dietFilter !== "All") params.set("diet", dietFilter);
        const res = await fetch(`/api/meal-plans/dishes?${params}`);
        const data = await res.json();
        setDishResults(data.dishes ?? []);
      } catch {
        setDishResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [showAdd, search, mealType, dietFilter]);

  const handleAddDish = async (dishId: string, servings: number) => {
    if (!selectedDate) return;
    if (plannedMealTypes.has(mealType)) {
      setError("This meal type is already planned for this day.");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDate: selectedDate,
          mealType,
          dishId,
          servings,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add meal");
        return;
      }
      if (data.plan) {
        setPlans((prev) => [...prev, data.plan]);
      } else {
        await loadPlans();
      }
      setShowAdd(false);
      setSearch("");
    } catch {
      setError("Could not add meal");
    } finally {
      setAdding(false);
    }
  };

  const handleServingsChange = async (planId: number, servings: number) => {
    setUpdatingServingsId(planId);
    try {
      const res = await fetch("/api/meal-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, servings }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        setPlans((prev) =>
          prev.map((p) => (p.planId === planId ? (data.plan as MealPlanEntry) : p)),
        );
      }
    } finally {
      setUpdatingServingsId(null);
    }
  };

  const handleRemove = async (planId: number) => {
    setRemovingId(planId);
    try {
      const res = await fetch(`/api/meal-plans?planId=${planId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.planId !== planId));
      }
    } finally {
      setRemovingId(null);
    }
  };

  const fetchPlanStatus = useCallback(async () => {
    if (!previewOpen || !rangeFrom || !rangeTo) return;
    if (rangeFrom < todayKey || rangeTo < rangeFrom) {
      setPlanStatus(null);
      return;
    }

    setCheckingPlanStatus(true);
    try {
      const res = await fetch(
        `/api/shopping-list/plan-status?from=${rangeFrom}&to=${rangeTo}`,
      );
      const data = await res.json();
      if (res.ok) {
        setPlanStatus(data as PlanAddStatusResult);
      }
    } catch {
      /* keep previous state */
    } finally {
      setCheckingPlanStatus(false);
    }
  }, [previewOpen, rangeFrom, rangeTo, todayKey]);

  useEffect(() => {
    if (!previewOpen) return;
    const timer = setTimeout(() => {
      void fetchPlanStatus();
    }, 300);
    return () => clearTimeout(timer);
  }, [previewOpen, rangeFrom, rangeTo, plans, fetchPlanStatus]);

  const openGenerateModal = () => {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    setRangeFrom(todayKey);
    setRangeTo(toDateKey(end));
    setPreviewItems([]);
    setPreviewPlanCount(0);
    setHasGenerated(false);
    setPlanStatus(null);
    setPreviewError(null);
    setPreviewSuccess(null);
    setPreviewOpen(true);
  };

  const closeGenerateModal = () => {
    setPreviewOpen(false);
    setPreviewError(null);
    setPreviewSuccess(null);
    setGenerating(false);
  };

  const handleGenerateList = async () => {
    if (rangeFrom < todayKey) {
      setPreviewError("From date cannot be in the past.");
      return;
    }
    if (rangeTo < rangeFrom) {
      setPreviewError("To date cannot be before From date.");
      return;
    }

    setGenerating(true);
    setPreviewError(null);
    setPreviewSuccess(null);
    try {
      const res = await fetch("/api/shopping-list/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: rangeFrom, to: rangeTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error ?? "Could not generate list");
        return;
      }
      setPreviewItems(data.items ?? []);
      setPreviewPlanCount(data.planCount ?? 0);
      setPlanStatus(data.planStatus ?? null);
      setHasGenerated(true);
    } catch {
      setPreviewError("Could not generate shopping list");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToViewList = async () => {
    if (planStatus?.status === "empty" || planStatus?.status === "all_added") {
      return;
    }
    setSavingList(true);
    setPreviewError(null);
    setPreviewSuccess(null);
    try {
      const res = await fetch("/api/shopping-list/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: rangeFrom, to: rangeTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error ?? "Could not save list");
        return;
      }
      if (data.status) {
        setPlanStatus(data.status as PlanAddStatusResult);
      } else {
        await fetchPlanStatus();
      }
      setPreviewSuccess("Added to View List");
    } catch {
      setPreviewError("Could not save shopping list");
    } finally {
      setSavingList(false);
    }
  };

  const calendarWeeks = daysInMonthGrid(viewMonth);

  const openAddMeal = () => {
    if (selectedIsPast || allMealsPlanned) return;
    const next = getFirstAvailableMealType(plannedMealTypes);
    if (next) setMealType(next);
    setDietFilter("All");
    setSearch("");
    setAddServings(2);
    setError(null);
    setShowAdd(true);
  };

  const dayPanel = selectedDate && (
    <DayPanelContent
      selectedDate={selectedDate}
      plans={selectedPlans}
      plannedMealTypes={plannedMealTypes}
      allMealsPlanned={allMealsPlanned}
      isPastDate={selectedIsPast}
      showAdd={showAdd}
      mealType={mealType}
      dietFilter={dietFilter}
      search={search}
      dishResults={dishResults}
      searching={searching}
      adding={adding}
      error={error}
      removingId={removingId}
      addServings={addServings}
      onAddServingsChange={setAddServings}
      updatingServingsId={updatingServingsId}
      onClose={() => {
        setShowAdd(false);
        if (window.innerWidth < 768) setSelectedDate(null);
      }}
      onShowAdd={openAddMeal}
      onCancelAdd={() => {
        setShowAdd(false);
        setError(null);
      }}
      onMealType={setMealType}
      onDietFilter={setDietFilter}
      onSearch={setSearch}
      onAddDish={handleAddDish}
      onServingsChange={selectedIsPast ? undefined : handleServingsChange}
      onRemove={handleRemove}
    />
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-center sm:text-left">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 sm:mx-0">
            <IconCalendar className="h-7 w-7 text-brand" />
          </span>
          <h1 className="text-3xl font-bold text-foreground">Meal Planning</h1>
          <p className="mt-2 text-muted">
            Plan breakfast, lunch, and dinner from your recipe library.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={openGenerateModal}
            className="btn-primary"
          >
            <IconShoppingCart size={18} />
            Generate Shopping List
          </button>
          <Link href="/shopping-list" className="btn-secondary">
            View list
          </Link>
        </div>
      </header>

      {error && !showAdd && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <article className="card p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                className="rounded-xl p-2 text-muted hover:bg-warm-100"
                aria-label="Previous month"
              >
                <IconChevronLeft size={22} />
              </button>
              <h2 className="text-lg font-semibold">{formatMonthYear(viewMonth)}</h2>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="rounded-xl p-2 text-muted hover:bg-warm-100"
                aria-label="Next month"
              >
                <IconChevronRight size={22} />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {loading ? (
              <LoadingState message="Loading calendar…" />
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarWeeks.flat().map((dateKey, i) => {
                  if (!dateKey) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  const dayNum = parseDateKey(dateKey).getDate();
                  const count = plansByDate.get(dateKey)?.length ?? 0;
                  const isSelected = selectedDate === dateKey;
                  const isToday = dateKey === todayKey;
                  const isPast = isPastDateKey(dateKey, todayKey);

                  const cellClass = cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm",
                    isPast && "cursor-not-allowed opacity-40",
                    !isPast &&
                      (isSelected
                        ? "bg-brand text-white shadow-sm"
                        : "transition-colors hover:bg-warm-100"),
                    isToday && !isSelected && !isPast && "ring-2 ring-brand/40",
                  );

                  const dots =
                    count > 0 ? (
                      <span
                        className={cn(
                          "absolute bottom-1 flex gap-0.5",
                          isSelected && !isPast ? "opacity-90" : "",
                        )}
                      >
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
          </article>

          <article className="card p-4 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold">This week</h2>
            <ul className="space-y-2">
              {weekDays.map((dateKey) => {
                const count = plansByDate.get(dateKey)?.length ?? 0;
                const isPast = isPastDateKey(dateKey, todayKey);
                const label = parseDateKey(dateKey).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <li key={dateKey}>
                    {isPast ? (
                      <div
                        aria-disabled
                        className="flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm opacity-40"
                      >
                        <span>{label}</span>
                        <span className="text-muted">
                          {count === 0 ? "No meals" : `${count} meal${count > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(dateKey)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                          selectedDate === dateKey
                            ? "bg-brand/10 text-brand-dark"
                            : "hover:bg-warm-50",
                        )}
                      >
                        <span>{label}</span>
                        <span className="text-muted">
                          {count === 0 ? "No meals" : `${count} meal${count > 1 ? "s" : ""}`}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24 card p-4">
            {selectedDate ? (
              dayPanel
            ) : (
              <p className="text-sm text-muted">Select a date on the calendar.</p>
            )}
          </div>
        </aside>
      </div>

      <ShoppingListPreviewModal
        open={previewOpen}
        fromDate={rangeFrom}
        toDate={rangeTo}
        onFromDateChange={setRangeFrom}
        onToDateChange={setRangeTo}
        items={previewItems}
        planCount={previewPlanCount}
        hasGenerated={hasGenerated}
        planStatus={planStatus}
        checkingPlanStatus={checkingPlanStatus}
        loading={generating}
        saving={savingList}
        error={previewError}
        success={previewSuccess}
        todayKey={todayKey}
        onClose={closeGenerateModal}
        onGenerate={() => void handleGenerateList()}
        onAddToViewList={() => void handleAddToViewList()}
      />

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 lg:hidden">
          <button
            type="button"
            className="flex-1"
            aria-label="Close"
            onClick={() => setSelectedDate(null)}
          />
          <div className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-background p-4 pb-8 shadow-xl">
            <div className="mb-3 flex justify-center">
              <span className="h-1 w-10 rounded-full bg-warm-200" />
            </div>
            {dayPanel}
          </div>
        </div>
      )}
    </div>
  );
}

function DayPanelContent({
  selectedDate,
  plans,
  plannedMealTypes,
  allMealsPlanned,
  isPastDate,
  showAdd,
  mealType,
  dietFilter,
  search,
  dishResults,
  searching,
  adding,
  error,
  removingId,
  addServings,
  onAddServingsChange,
  updatingServingsId,
  onClose,
  onShowAdd,
  onCancelAdd,
  onMealType,
  onDietFilter,
  onSearch,
  onAddDish,
  onServingsChange,
  onRemove,
}: {
  selectedDate: string;
  plans: MealPlanEntry[];
  plannedMealTypes: Set<MealType>;
  allMealsPlanned: boolean;
  isPastDate: boolean;
  showAdd: boolean;
  mealType: MealType;
  dietFilter: DietFilter;
  search: string;
  dishResults: DishSearchResult[];
  searching: boolean;
  adding: boolean;
  error: string | null;
  removingId: number | null;
  addServings: number;
  onAddServingsChange: (n: number) => void;
  updatingServingsId: number | null;
  onClose: () => void;
  onShowAdd: () => void;
  onCancelAdd: () => void;
  onMealType: (m: MealType) => void;
  onDietFilter: (d: DietFilter) => void;
  onSearch: (q: string) => void;
  onAddDish: (dishId: string, servings: number) => void;
  onServingsChange?: (planId: number, servings: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Selected day
          </p>
          <h2 className="text-lg font-semibold">{formatDisplayDate(selectedDate)}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-muted hover:bg-warm-100 lg:hidden"
          aria-label="Close"
        >
          <IconX size={20} />
        </button>
      </div>

      {!showAdd ? (
        <>
          {isPastDate ? (
            <p className="rounded-xl bg-warm-50 px-3 py-2 text-sm text-muted">
              Past dates cannot be edited.
            </p>
          ) : allMealsPlanned ? (
            <p className="rounded-xl bg-brand/10 px-3 py-2 text-sm text-brand-dark">
              All meals are already planned for this day.
            </p>
          ) : (
            <button type="button" onClick={onShowAdd} className="btn-primary w-full">
              <IconPlus size={18} />
              Add meal
            </button>
          )}

          {plans.length === 0 ? (
            <p className="text-sm text-muted">No meals planned yet.</p>
          ) : (
            <ul className="space-y-3">
              {MEAL_TYPES.map((type) => {
                const group = plans.filter((p) => p.mealType === type);
                if (group.length === 0) return null;
                return (
                  <li key={type} className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted">{type}</h3>
                    {group.map((plan) => (
                      <PlanMealRow
                        key={plan.planId}
                        plan={plan}
                        onRemove={isPastDate ? undefined : onRemove}
                        onServingsChange={onServingsChange}
                        removing={removingId === plan.planId}
                        updatingServings={updatingServingsId === plan.planId}
                      />
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">Add meal</h3>
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-min gap-2 px-1">
              {MEAL_TYPES.map((type) => {
                const isPlanned = plannedMealTypes.has(type);
                const isActive = mealType === type && !isPlanned;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isPlanned}
                    onClick={() => onMealType(type)}
                    title={isPlanned ? "Already planned" : undefined}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      isPlanned &&
                        "cursor-not-allowed border-warm-200 bg-warm-50 text-muted opacity-50",
                      !isPlanned && isActive && "chip-active",
                      !isPlanned && !isActive && "chip",
                    )}
                  >
                    {type}
                    {isPlanned && (
                      <span className="ml-1 text-[10px] font-normal">· planned</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Diet
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {DIET_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onDietFilter(option)}
                  className={dietFilter === option ? "chip-active" : "chip"}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Servings
            </p>
            <ServingSelector
              value={addServings}
              onChange={onAddServingsChange}
              disabled={adding}
            />
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search dishes…"
            className="input"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {searching ? (
            <LoadingState message="Searching dishes…" />
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {dishResults.map((dish) => (
                <li key={dish.dishId}>
                  <button
                    type="button"
                    disabled={adding}
                    onClick={() => void onAddDish(dish.dishId, addServings)}
                    className="card-hover w-full p-3 text-left"
                  >
                    <p className="font-medium">{dish.dishName}</p>
                    <p className="text-xs text-muted">
                      {dish.cuisineName} · {dish.dishType} · Prep {dish.prepTime}m ·
                      Serves {dish.baseServings}
                    </p>
                  </button>
                </li>
              ))}
              {dishResults.length === 0 && (
                <p className="text-sm text-muted">No dishes found.</p>
              )}
            </ul>
          )}
          <button type="button" onClick={onCancelAdd} className="btn-secondary w-full">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
