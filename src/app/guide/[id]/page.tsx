import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { StepGuide } from "@/components/guide/StepGuide";
import { getDishById } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidePage({ params }: PageProps) {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish || dish.steps.length === 0) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/dishes/${dish.dishId}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <IconArrowLeft size={16} />
        Back to dish
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-foreground">Step-by-step guide</h1>
        <p className="text-muted">{dish.dishName}</p>
      </header>
      <StepGuide dish={dish} />
    </div>
  );
}
