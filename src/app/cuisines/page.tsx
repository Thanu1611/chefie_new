import { CuisineCard } from "@/components/home/CuisineCard";
import { getAllCuisines } from "@/lib/db/queries";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CuisinesPage() {
  const cuisines = await getAllCuisines();

  return (
    <div className="space-y-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground">Pick a cuisine</h1>
        <p className="mt-2 text-muted md:text-lg">
          Explore authentic dishes from Chinese, Indian, and Sri Lankan culinary
          traditions.
        </p>
      </header>

      {cuisines.length === 0 ? (
        <EmptyState
          title="No cuisines in database"
          description="Run npm run db:setup once, or paste supabase/setup.sql in Supabase SQL Editor."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cuisines.map((cuisine) => (
            <CuisineCard key={cuisine.cuisineId} cuisine={cuisine} />
          ))}
        </div>
      )}
    </div>
  );
}
