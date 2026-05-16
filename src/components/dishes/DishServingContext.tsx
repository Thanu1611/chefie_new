"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getScaleFactor, scaleMinutes } from "@/lib/dishes/ingredient-scaling";

interface DishServingContextValue {
  selectedServings: number;
  setSelectedServings: (value: number) => void;
  baseServings: number;
  scaledPrepTime: number;
  scaledCookTime: number;
}

const DishServingContext = createContext<DishServingContextValue | null>(null);

export function DishServingProvider({
  baseServings,
  prepTime,
  cookingTime,
  children,
}: {
  baseServings: number;
  prepTime: number;
  cookingTime: number;
  children: ReactNode;
}) {
  const defaultServings = baseServings > 0 ? baseServings : 2;
  const [selectedServings, setSelectedServings] = useState(defaultServings);

  const value = useMemo(() => {
    const factor = getScaleFactor(selectedServings, defaultServings);
    return {
      selectedServings,
      setSelectedServings,
      baseServings: defaultServings,
      scaledPrepTime: scaleMinutes(prepTime, factor),
      scaledCookTime: scaleMinutes(cookingTime, factor),
    };
  }, [selectedServings, defaultServings, prepTime, cookingTime]);

  return (
    <DishServingContext.Provider value={value}>{children}</DishServingContext.Provider>
  );
}

export function useDishServing() {
  const ctx = useContext(DishServingContext);
  if (!ctx) {
    throw new Error("useDishServing must be used within DishServingProvider");
  }
  return ctx;
}
