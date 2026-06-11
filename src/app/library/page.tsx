"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconBook2 } from "@tabler/icons-react";
import { DishCard } from "@/components/dishes/DishCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useSavedDishes } from "@/hooks/useSavedDishes";
import type { Dish } from "@/types/dish";

export default function LibraryPage() {
  const { saved, loaded, remove } = useSavedDishes();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const savedIdKey = useMemo(
    () =>
      saved
        .map((entry) => entry.dishId)
        .sort()
        .join("\n"),
    [saved],
  );
  const prevSavedIdKeyRef = useRef("");

  const handleRemoveFromLibrary = async (dish: Dish) => {
    setRemovingId(dish.dishId);
    setDishes((prev) => prev.filter((d) => d.dishId !== dish.dishId));
    try {
      const ok = await remove(dish.dishId);
      if (!ok) {
        setDishes((prev) =>
          prev.some((d) => d.dishId === dish.dishId) ? prev : [...prev, dish],
        );
      }
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    if (!loaded) return;

    const prevKey = prevSavedIdKeyRef.current;
    prevSavedIdKeyRef.current = savedIdKey;

    if (saved.length === 0) {
      setDishes([]);
      setLoading(false);
      return;
    }

    const prevIds = new Set(prevKey.split("\n").filter(Boolean));
    const nextIds = savedIdKey.split("\n").filter(Boolean);
    const isRemovalOnly =
      prevIds.size > 0 &&
      nextIds.length < prevIds.size &&
      nextIds.every((id) => prevIds.has(id));

    if (isRemovalOnly) {
      setDishes((prev) => prev.filter((dish) => nextIds.includes(dish.dishId)));
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          saved.map(async (entry) => {
            const res = await fetch(`/api/dishes/${entry.dishId}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.dish as Dish;
          }),
        );
        setDishes(results.filter(Boolean) as Dish[]);
      } catch {
        setDishes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [loaded, saved, savedIdKey]);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15">
          <IconBook2 className="h-6 w-6 text-brand" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Library</h1>
          <p className="text-muted">Your saved dishes in one place.</p>
        </div>
      </header>

      {!loaded || loading ? (
        <LoadingState message="Loading your library..." />
      ) : dishes.length === 0 ? (
        <EmptyState
          title="No saved dishes yet"
          description="Tap Add to library on any dish to save it here."
          action={
            <Link href="/cuisines" className="btn-primary">
              Browse cuisines
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish) => (
            <DishCard
              key={dish.dishId}
              dish={dish}
              removing={removingId === dish.dishId}
              onRemoveFromLibrary={() => void handleRemoveFromLibrary(dish)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
