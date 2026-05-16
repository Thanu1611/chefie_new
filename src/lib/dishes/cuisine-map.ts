import type { Cuisine as AppCuisine } from "@/types/recipe";

/** Map UI cuisine id to database cuisine_id (e.g. sri-lankan → sri_lankan). */
export function appCuisineToDbId(cuisine: AppCuisine): string {
  if (cuisine === "sri-lankan") return "sri_lankan";
  return cuisine;
}

export function dbCuisineToAppId(cuisineId: string): AppCuisine {
  if (cuisineId === "sri_lankan") return "sri-lankan";
  if (cuisineId === "indian") return "indian";
  return "chinese";
}
