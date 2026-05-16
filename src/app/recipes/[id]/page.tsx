import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyRecipeRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/dishes/${id}`);
}
