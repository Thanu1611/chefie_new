/** Curated Unsplash URLs — one per seeded dish name. */
const DISH_IMAGE_BY_NAME: Record<string, string> = {
  // Chinese
  "Congee with Greens":
    "https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80",
  "Steamed Vegetable Buns":
    "https://images.unsplash.com/photo-1496116218417-697325aee646?w=800&q=80",
  "Egg Jianbing":
    "https://images.unsplash.com/photo-1529042416850-9bc9d91a63f3?w=800&q=80",
  "Chicken Congee":
    "https://images.unsplash.com/photo-1604908176997-43162f4d978e?w=800&q=80",
  "Mapo Tofu (Vegetarian)":
    "https://images.unsplash.com/photo-1525755662778-989dbe24aef7?w=800&q=80",
  "Vegetable Fried Rice":
    "https://images.unsplash.com/photo-1603139819008-e49cbeb0a889?w=800&q=80",
  "Kung Pao Chicken":
    "https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80",
  "Sweet and Sour Pork":
    "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80",
  "Buddha's Delight":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Dan Dan Noodles (Veg)":
    "https://images.unsplash.com/photo-1569714482467-e28fb53a82af?w=800&q=80",
  "Peking Duck Pancakes":
    "https://images.unsplash.com/photo-1518495976271-974dc5e82205?w=800&q=80",
  "Steamed Whole Fish":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80",
  // Sri Lankan
  "String Hoppers with Sambol":
    "https://images.unsplash.com/photo-1589302168068-964664a07101?w=800&q=80",
  "Coconut Roti":
    "https://images.unsplash.com/photo-1626073833769-9a477b1a7621?w=800&q=80",
  "Egg Hoppers":
    "https://images.unsplash.com/photo-1604908176997-43162f4d978e?w=800&q=80",
  "Fish Cutlets":
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
  "Dhal Curry":
    "https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80",
  "Jackfruit Mallung":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
  "Chicken Curry":
    "https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80",
  "Fish Ambul Thiyal":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80",
  "Wambatu Moju":
    "https://images.unsplash.com/photo-1625944525533-473f1a3d54e0?w=800&q=80",
  "Gotu Kola Mallung":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
  "Lamprais":
    "https://images.unsplash.com/photo-1589302168068-964664a07101?w=800&q=80",
  "Devilled Prawns":
    "https://images.unsplash.com/photo-1565680018434-b703d6b0d332?w=800&q=80",
  // Indian
  "Masala Dosa":
    "https://images.unsplash.com/photo-1630384060420-c9d46e2e8c2e?w=800&q=80",
  "Poha":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  "Egg Bhurji":
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
  "Chicken Keema Pav":
    "https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80",
  "Dal Tadka":
    "https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80",
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "Fish Curry (Coastal)":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80",
  "Palak Paneer":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
  "Vegetable Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "Butter Chicken":
    "https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80",
  "Lamb Rogan Josh":
    "https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80",
};

export const DISH_PLACEHOLDER = "/dish-placeholder.svg";

const GENERIC_FOOD =
  "https://images.unsplash.com/photo-1555939593-14d3c0590d7b?w=800&q=80";

export function getDishImageUrl(dishName: string): string {
  return DISH_IMAGE_BY_NAME[dishName] ?? GENERIC_FOOD;
}
