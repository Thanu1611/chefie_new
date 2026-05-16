import Image from "next/image";
import Link from "next/link";
import {
  IconChefHat,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import { CuisineCard } from "@/components/home/CuisineCard";
import { CUISINES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <Image
              src="/logo.png"
              alt="Chefie logo"
              width={56}
              height={56}
              className="rounded-2xl shadow-md"
              priority
            />
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Chef<span className="text-brand">ie</span>
            </h1>
          </div>
          <p className="text-lg text-muted md:text-xl">
            Your friendly cooking companion for Chinese, Indian, and Sri Lankan
            flavors — with voice guidance, step-by-step mode, and AI recipes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/recipes" className="btn-primary text-base">
              <IconChefHat size={20} />
              Start Cooking
            </Link>
            <Link href="/recipes" className="btn-secondary text-base">
              <IconSearch size={20} />
              Explore Recipes
            </Link>
          </div>
        </div>

        <div className="card relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand/20 via-warm-100 to-warm-50">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=80"
            alt="Cooking in a warm kitchen"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur">
            <p className="text-sm font-medium text-foreground">
              Cook with confidence
            </p>
            <p className="text-xs text-muted">
              Voice assistant · Timers · AI recipe generator
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground">Pick a cuisine</h2>
          <p className="mt-1 text-muted">
            Explore authentic recipes from three vibrant culinary traditions.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CUISINES.map((c) => (
            <CuisineCard key={c.id} {...c} />
          ))}
        </div>
      </section>

      <section className="card bg-gradient-to-r from-brand/10 to-warm-100 p-6 md:flex md:items-center md:justify-between md:p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Have ingredients at home?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Let Chefie&apos;s AI suggest a recipe from what you already have.
          </p>
        </div>
        <Link href="/generate" className="btn-primary mt-4 md:mt-0">
          <IconSparkles size={18} />
          Generate Recipe
        </Link>
      </section>
    </div>
  );
}

