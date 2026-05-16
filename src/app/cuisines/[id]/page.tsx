import { notFound } from "next/navigation";
import { CuisineDishesClient } from "@/components/cuisines/CuisineDishesClient";
import { getCuisineById, getDishesByCuisine } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CuisinePage({ params }: PageProps) {
  const { id } = await params;
  const cuisine = await getCuisineById(id);
  if (!cuisine) notFound();

  const dishList = await getDishesByCuisine(id);

  return <CuisineDishesClient cuisine={cuisine} dishes={dishList} />;
}
