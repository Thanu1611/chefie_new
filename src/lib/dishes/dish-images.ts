import { sanitizeRemoteImageUrl } from "@/lib/images/remote-image";
import {
  DISH_IMAGE_PATHS,
  getLocalDishImagePath,
} from "@/lib/dishes/dish-image-paths";
import type { DishType } from "@/types/dish";
import type { Cuisine } from "@/types/recipe";

export const DISH_PLACEHOLDER = "/dish-placeholder.svg";

const CURD_RICE_NAME_PATTERN =
  /curd\s*rice|thayir\s*sadam|thayir\s*saadam|thayir\s*sorru|yogurt\s*rice|mosaruanna/i;

const CUISINE_DEFAULTS: Record<
  Cuisine,
  { Veg: string; "Non-Veg": string }
> = {
  "sri-lankan": {
    Veg: "/dishes/dhal-curry.jpg",
    "Non-Veg": "/dishes/chicken-curry.jpg",
  },
  indian: {
    Veg: "/dishes/dal-tadka.jpg",
    "Non-Veg": "/dishes/chicken-biryani.jpg",
  },
  chinese: {
    Veg: "/dishes/vegetable-fried-rice.jpg",
    "Non-Veg": "/dishes/kung-pao-chicken.jpg",
  },
};

type KeywordRule = {
  pattern: RegExp;
  image: string | ((dishType: DishType) => string);
};

const GENERATED_KEYWORD_RULES: KeywordRule[] = [
  {
    pattern: /biryani|biriyani/i,
    image: (dishType) =>
      dishType === "Veg"
        ? "/dishes/vegetable-biryani.jpg"
        : "/dishes/chicken-biryani.jpg",
  },
  { pattern: /dosa|idli|idly|uthappam/i, image: "/dishes/masala-dosa.jpg" },
  { pattern: /curd|thayir|mosaru|yogurt rice/i, image: "/dishes/curd-rice.jpg" },
  { pattern: /poha|aval/i, image: "/dishes/poha.jpg" },
  {
    pattern: /shake|smoothie|lassi|milkshake|ஷேக்/i,
    image: "https://images.unsplash.com/photo-1623065424902-f66fcfb4b465?w=1200&q=85",
  },
  {
    pattern: /date|பேரிச்ச|khajoor/i,
    image: "https://images.unsplash.com/photo-1623065424902-f66fcfb4b465?w=1200&q=85",
  },
  { pattern: /chai|tea|coffee/i, image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&q=85" },
  { pattern: /juice/i, image: "https://images.unsplash.com/photo-1613478223719-2ab802b836f2?w=1200&q=85" },
  { pattern: /paneer|palak/i, image: "/dishes/paneer-butter-masala.jpg" },
  { pattern: /dal|dhal|sambar|parippu/i, image: "/dishes/dal-tadka.jpg" },
  {
    pattern: /butter chicken|murgh makhani|kozhi kulambu/i,
    image: "/dishes/butter-chicken.jpg",
  },
  { pattern: /rogan josh|lamb|mutton/i, image: "/dishes/lamb-rogan-josh.jpg" },
  { pattern: /fish|meen|ambul thiyal/i, image: "/dishes/fish-curry-coastal.jpg" },
  { pattern: /prawn|shrimp|devilled/i, image: "/dishes/devilled-prawns.jpg" },
  { pattern: /egg|mutta|bhurji|hopper|appam/i, image: "/dishes/egg-hoppers.jpg" },
  {
    pattern: /idiyappam|string hopper|nool/i,
    image: "/dishes/string-hoppers-with-sambol.jpg",
  },
  { pattern: /roti|paratha|pol roti/i, image: "/dishes/coconut-roti.jpg" },
  { pattern: /lamprais/i, image: "/dishes/lamprais.jpg" },
  { pattern: /mallung|mallum|gotu kola/i, image: "/dishes/gotu-kola-mallung.jpg" },
  { pattern: /wambatu|brinjal|eggplant|moju/i, image: "/dishes/wambatu-moju.jpg" },
  { pattern: /cutlet/i, image: "/dishes/fish-cutlets.jpg" },
  { pattern: /fried rice/i, image: "/dishes/vegetable-fried-rice.jpg" },
  { pattern: /noodle|dan dan|ramen|chow mein/i, image: "/dishes/dan-dan-noodles-veg.jpg" },
  { pattern: /dumpling|bao|bun|mantou/i, image: "/dishes/steamed-vegetable-buns.jpg" },
  { pattern: /tofu|mapo/i, image: "/dishes/mapo-tofu-vegetarian.jpg" },
  { pattern: /duck|peking/i, image: "/dishes/peking-duck-pancakes.jpg" },
  { pattern: /congee|porridge|jianbing/i, image: "/dishes/congee-with-greens.jpg" },
  { pattern: /kung pao/i, image: "/dishes/kung-pao-chicken.jpg" },
  { pattern: /sweet and sour/i, image: "/dishes/sweet-and-sour-pork.jpg" },
  {
    pattern: /curry|kulambu|kuzhambu/i,
    image: (dishType) =>
      dishType === "Veg" ? "/dishes/dhal-curry.jpg" : "/dishes/chicken-curry.jpg",
  },
  { pattern: /keema|pav/i, image: "/dishes/chicken-keema-pav.jpg" },
];

function curatedImage(dishName: string): string | undefined {
  const local = getLocalDishImagePath(dishName);
  if (local) return local;
  if (CURD_RICE_NAME_PATTERN.test(dishName)) {
    return DISH_IMAGE_PATHS["Curd Rice"];
  }
  return undefined;
}

function matchGeneratedKeywordImage(
  searchText: string,
  dishType: DishType,
): string | undefined {
  for (const rule of GENERATED_KEYWORD_RULES) {
    if (!rule.pattern.test(searchText)) continue;
    const image =
      typeof rule.image === "function" ? rule.image(dishType) : rule.image;
    if (image.startsWith("http")) return sanitizeRemoteImageUrl(image);
    return image;
  }
  return undefined;
}

/** Local curated photo for a seeded / known dish name. */
export function getDishImageUrl(dishName: string): string {
  return curatedImage(dishName) ?? DISH_PLACEHOLDER;
}

/** Prefer curated local photos; fall back to a sanitized remote AI URL. */
export function resolveDishImageUrl(
  dishName: string,
  remoteUrl?: string,
): string {
  const local = curatedImage(dishName);
  if (local) return local;
  if (remoteUrl?.trim()) return sanitizeRemoteImageUrl(remoteUrl);
  return DISH_PLACEHOLDER;
}

/** Pick a food photo for AI-generated recipes (name + cuisine + type). */
export function resolveGeneratedDishImageUrl(
  dishName: string,
  cuisine: Cuisine,
  dishType: DishType,
  extraSearchText?: string,
): string {
  const corpus = `${dishName} ${extraSearchText ?? ""}`.trim();

  const exact = curatedImage(dishName);
  if (exact) return exact;

  const keyword = matchGeneratedKeywordImage(corpus, dishType);
  if (keyword) return keyword;

  return CUISINE_DEFAULTS[cuisine][dishType];
}
