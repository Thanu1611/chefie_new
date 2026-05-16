"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook2 } from "@tabler/icons-react";
import { DishCard } from "@/components/dishes/DishCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useSavedDishes } from "@/hooks/useSavedDishes";
import type { Dish } from "@/types/dish";

export default function LibraryPage() {
  const { saved, loaded } = useSavedDishes();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    if (saved.length === 0) {
      setDishes([]);
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
  }, [loaded, saved]);

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
            <DishCard key={dish.dishId} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}
