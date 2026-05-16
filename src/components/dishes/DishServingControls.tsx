"use client";

import { useDishServing } from "@/components/dishes/DishServingContext";
import { ServingSelector } from "@/components/dishes/ServingSelector";

export function DishServingControls() {
  const { selectedServings, setSelectedServings, baseServings } = useDishServing();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Recipe serves {baseServings}. Adjust portions to update ingredients and times.
      </p>
      <ServingSelector
        value={selectedServings}
        onChange={setSelectedServings}
      />
    </div>
  );
}
