/** User-friendly message for common Supabase / PostgREST errors. */
export function formatSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("dish_ingredients") &&
    (lower.includes("schema cache") ||
      lower.includes("does not exist") ||
      lower.includes("could not find the table"))
  ) {
    return (
      "The dish_ingredients table is not set up yet. In Supabase, open SQL Editor, " +
      "paste and run the file supabase/create-dish-ingredients-only.sql in this project, " +
      "then click Add to Recipes again."
    );
  }

  return message;
}
