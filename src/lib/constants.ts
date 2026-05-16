import type { Cuisine } from "@/types/recipe";

export const BRAND_COLOR = "#ff9066";

export const CUISINES: {
  id: Cuisine;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "chinese",
    label: "Chinese",
    description: "Wok-fired classics & dim sum favorites",
    emoji: "🥢",
  },
  {
    id: "indian",
    label: "Indian",
    description: "Curries, biryanis & vibrant spices",
    emoji: "🍛",
  },
  {
    id: "sri-lankan",
    label: "Sri Lankan",
    description: "Island curries, hoppers & sambols",
    emoji: "🌴",
  },
];

export const SPICY_LABELS = ["Mild", "Light", "Medium", "Hot"] as const;

export const LIBRARY_STORAGE_KEY = "chefie-saved-recipes";
