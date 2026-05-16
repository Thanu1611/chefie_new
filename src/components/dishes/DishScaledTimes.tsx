"use client";

import { IconClock } from "@tabler/icons-react";
import { useDishServing } from "@/components/dishes/DishServingContext";

export function DishScaledTimes() {
  const { scaledPrepTime, scaledCookTime } = useDishServing();

  return (
    <span className="inline-flex items-center gap-1">
      <IconClock size={18} className="text-brand" />
      Prep {scaledPrepTime} min · Cook {scaledCookTime} min
    </span>
  );
}
