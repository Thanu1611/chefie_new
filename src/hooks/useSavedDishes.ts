"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chefie-saved-dishes";

export interface SavedDishEntry {
  dishId: string;
  dishName: string;
}

export function useSavedDishes() {
  const [saved, setSaved] = useState<SavedDishEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedDishEntry[]);
    } catch {
      setSaved([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((entries: SavedDishEntry[]) => {
    setSaved(entries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const isSaved = useCallback(
    (dishId: string) => saved.some((s) => s.dishId === dishId),
    [saved],
  );

  const toggleSave = useCallback(
    (dishId: string, dishName: string) => {
      const exists = saved.some((s) => s.dishId === dishId);
      const next = exists
        ? saved.filter((s) => s.dishId !== dishId)
        : [...saved, { dishId, dishName }];
      persist(next);
      return !exists;
    },
    [saved, persist],
  );

  const remove = useCallback(
    (dishId: string) => {
      persist(saved.filter((s) => s.dishId !== dishId));
    },
    [saved, persist],
  );

  return { saved, loaded, isSaved, toggleSave, remove };
}
