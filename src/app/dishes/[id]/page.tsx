import Link from "next/link";
import { DishImage } from "@/components/dishes/DishImage";
import { notFound } from "next/navigation";
import {
  IconLeaf,
  IconList,
  IconMeat,
  IconMicrophone,
} from "@tabler/icons-react";
import { DishDetailIngredients } from "@/components/dishes/DishDetailIngredients";
import { DishScaledTimes } from "@/components/dishes/DishScaledTimes";
import { DishServingControls } from "@/components/dishes/DishServingControls";
import { DishServingProvider } from "@/components/dishes/DishServingContext";
import { getDishBaseServings, getDishIngredientsByDishId } from "@/lib/dishes/get-dish-ingredients";
import { getDishById } from "@/lib/db/queries";
import { DishDetailActions } from "./DishDetailActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DishDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dish = await getDishById(id);
  if (!dish) notFound();

  const [ingredients, baseServings] = await Promise.all([
    getDishIngredientsByDishId(dish.dishId, dish.dishName),
    getDishBaseServings(dish.dishId),
  ]);

  const isVeg = dish.dishType === "Veg";

  return (
    <DishServingProvider
      baseServings={baseServings}
      prepTime={dish.prepTime}
      cookingTime={dish.cookingTime}
    >
    <article className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-warm-100">
          <DishImage
            src={dish.imageUrl}
            alt={dish.dishName}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-brand">
            {dish.cuisine?.cuisineName} · {dish.mealType}
          </p>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {dish.dishName}
          </h1>
          <p className="text-muted">{dish.description}</p>
          <ul className="flex flex-wrap gap-4 text-sm text-muted">
            <li className="inline-flex items-center gap-1">
              {isVeg ? <IconLeaf size={18} className="text-brand" /> : <IconMeat size={18} className="text-brand" />}
              {dish.dishType}
            </li>
            <li>
              <DishScaledTimes />
            </li>
          </ul>

          <DishServingControls />

          <DishDetailActions dishId={dish.dishId} dishName={dish.dishName} />

          <section className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/voice?dishId=${dish.dishId}`} className="btn-primary flex-1 justify-center">
              <IconMicrophone size={18} />
              Voice assistant
            </Link>
            <Link href={`/guide/${dish.dishId}`} className="btn-secondary flex-1 justify-center">
              <IconList size={18} />
              Step-by-step guide
            </Link>
          </section>
        </div>
      </div>

      <DishDetailIngredients ingredients={ingredients} />

      <section className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Cooking steps preview</h2>
        <ol className="space-y-3">
          {dish.steps.map((step) => (
            <li key={step.stepId} className="flex gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                {step.stepNumber}
              </span>
              <section>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-muted">{step.instruction}</p>
              </section>
            </li>
          ))}
        </ol>
      </section>
    </article>
    </DishServingProvider>
  );
}
