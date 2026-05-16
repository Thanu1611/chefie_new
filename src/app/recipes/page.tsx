import { Suspense } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { RecipesClient } from "./RecipesClient";

export default function RecipesPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading recipes..." />}>
      <RecipesClient />
    </Suspense>
  );
}
