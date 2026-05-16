import Link from "next/link";
import {
  IconArrowRight,
  IconBowl,
  IconLeaf,
  IconPepper,
} from "@tabler/icons-react";
import type { Cuisine } from "@/types/recipe";
import { cn } from "@/lib/utils/cn";

const cuisineIcons: Record<Cuisine, typeof IconBowl> = {
  chinese: IconBowl,
  indian: IconPepper,
  "sri-lankan": IconLeaf,
};

interface CuisineCardProps {
  id: Cuisine;
  label: string;
  description: string;
  emoji: string;
  className?: string;
}

export function CuisineCard({
  id,
  label,
  description,
  emoji,
  className,
}: CuisineCardProps) {
  const Icon = cuisineIcons[id];

  return (
    <Link
      href={`/recipes?cuisine=${id}`}
      className={cn(
        "group card-hover flex flex-col gap-3 p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl" aria-hidden>
          {emoji}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          <Icon size={22} stroke={1.75} />
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
        Explore recipes
        <IconArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
