import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { StepGuide } from "@/components/guide/StepGuide";
import { getRecipeById } from "@/lib/recipes/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidePage({ params }: PageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/recipes/${recipe.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <IconArrowLeft size={16} />
        Back to recipe
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-foreground">Step-by-Step Guide</h1>
        <p className="text-muted">{recipe.name}</p>
      </header>
      <StepGuide recipe={recipe} />
    </div>
  );
}
