import { Suspense } from "react";
import { ShoppingListClient } from "@/components/meal-plan/ShoppingListClient";
import { LoadingState } from "@/components/ui/LoadingState";

export default function ShoppingListPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading shopping list…" />}>
      <ShoppingListClient />
    </Suspense>
  );
}
