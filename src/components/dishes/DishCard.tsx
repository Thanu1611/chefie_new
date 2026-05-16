import Link from "next/link";
import { DishImage } from "@/components/dishes/DishImage";
import { IconClock, IconLeaf, IconMeat } from "@tabler/icons-react";
import type { Dish } from "@/types/dish";

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const isVeg = dish.dishType === "Veg";

  return (
    <article className="card-hover overflow-hidden">
      <section className="relative aspect-[4/3] w-full overflow-hidden bg-warm-100">
        <DishImage
          src={dish.imageUrl}
          alt={dish.dishName}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span
          className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm ${
            isVeg ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-900"
          }`}
        >
          {isVeg ? <IconLeaf size={14} /> : <IconMeat size={14} />}
          {dish.dishType}
        </span>
      </section>
      <section className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
          {dish.dishName}
        </h3>
        <p className="text-sm text-muted line-clamp-2">{dish.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <IconClock size={16} className="text-brand" />
            Prep {dish.prepTime}m · Cook {dish.cookingTime}m
          </span>
        </div>
        <Link href={`/dishes/${dish.dishId}`} className="btn-secondary mt-2 w-full justify-center">
          View dish
        </Link>
      </section>
    </article>
  );
}
