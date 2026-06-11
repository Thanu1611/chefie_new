import Link from "next/link";
import { DishImage } from "@/components/dishes/DishImage";
import {
  IconBookmarkFilled,
  IconClock,
  IconLeaf,
  IconMeat,
  IconX,
} from "@tabler/icons-react";
import type { Dish } from "@/types/dish";

interface DishCardProps {
  dish: Dish;
  onRemoveFromLibrary?: () => void;
  removing?: boolean;
}

export function DishCard({
  dish,
  onRemoveFromLibrary,
  removing = false,
}: DishCardProps) {
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
            isVeg ? "badge-fresh" : "badge-category"
          }`}
        >
          {isVeg ? <IconLeaf size={14} /> : <IconMeat size={14} />}
          {dish.dishType}
        </span>
        {onRemoveFromLibrary ? (
          <button
            type="button"
            onClick={onRemoveFromLibrary}
            disabled={removing}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-brand shadow-md transition-colors hover:bg-brand hover:text-white disabled:opacity-60"
            aria-label={`Remove ${dish.dishName} from library`}
            title="Remove from library"
          >
            {removing ? (
              <IconX size={18} className="opacity-70" />
            ) : (
              <IconBookmarkFilled size={18} />
            )}
          </button>
        ) : null}
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
