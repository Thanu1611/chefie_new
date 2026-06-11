import type { Cuisine } from "@/types/recipe";

export { colors as themeColors } from "@/lib/theme/colors";

export const BRAND_COLOR = "#F57C00";

export const CUISINES: {
  id: Cuisine;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "sri-lankan",
    label: "Sri Lankan",
    description: "Island curries, hoppers & sambols",
    emoji: "🌴",
  },
  {
    id: "indian",
    label: "Indian",
    description: "Curries, biryanis & vibrant spices",
    emoji: "🍛",
  },
  {
    id: "chinese",
    label: "Chinese",
    description: "Wok-fired classics & dim sum favorites",
    emoji: "🥢",
  },
];

export const DEFAULT_CUISINE: Cuisine = "sri-lankan";

export const SPICY_LABELS = ["Mild", "Light", "Medium", "Hot"] as const;

export const LIBRARY_STORAGE_KEY = "chefie-saved-recipes";
