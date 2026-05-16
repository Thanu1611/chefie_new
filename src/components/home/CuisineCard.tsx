import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import type { Cuisine } from "@/types/dish";

export function CuisineCard({ cuisine }: { cuisine: Cuisine }) {
  return (
    <Link
      href={`/cuisines/${cuisine.cuisineId}`}
      className="group card-hover flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-warm-100">
        <Image
          src={cuisine.imageUrl}
          alt={cuisine.cuisineName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <section className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold text-foreground">{cuisine.cuisineName}</h3>
        <p className="text-sm text-muted">{cuisine.shortDescription}</p>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
          Explore dishes
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </section>
    </Link>
  );
}
