/** Ingredient lists keyed by exact seeded dish name (used in voice context). */
const DISH_INGREDIENTS: Record<string, string[]> = {
  "Congee with Greens": [
    "jasmine rice",
    "chicken or vegetable broth",
    "bok choy",
    "fresh ginger",
    "soy sauce",
    "white pepper",
    "sesame oil",
  ],
  "Steamed Vegetable Buns": [
    "mantou dough",
    "napa cabbage",
    "carrots",
    "shiitake mushrooms",
    "soy sauce",
    "sesame oil",
  ],
  "Egg Jianbing": [
    "mung bean flour",
    "eggs",
    "scallions",
    "savory sauce",
    "crispy cracker",
  ],
  "Chicken Congee": [
    "jasmine rice",
    "chicken breast",
    "ginger",
    "spring onion",
    "broth",
    "white pepper",
  ],
  "Mapo Tofu (Vegetarian)": [
    "silken tofu",
    "doubanjiang",
    "Sichuan peppercorn",
    "garlic",
    "ginger",
    "vegetable stock",
  ],
  "Vegetable Fried Rice": [
    "day-old rice",
    "peas",
    "carrots",
    "soy sauce",
    "sesame oil",
  ],
  "Kung Pao Chicken": [
    "chicken thigh",
    "peanuts",
    "dried chilies",
    "Sichuan pepper",
    "soy sauce",
    "rice vinegar",
  ],
  "Sweet and Sour Pork": [
    "pork shoulder",
    "cornstarch",
    "bell peppers",
    "pineapple",
    "vinegar",
    "ketchup",
    "sugar",
  ],
  "Buddha's Delight": [
    "tofu",
    "shiitake mushrooms",
    "baby corn",
    "snow peas",
    "light soy",
    "vegetable broth",
  ],
  "Dan Dan Noodles (Veg)": [
    "wheat noodles",
    "tahini",
    "chili oil",
    "soy sauce",
    "rice vinegar",
    "pickled mustard greens",
    "peanuts",
  ],
  "Peking Duck Pancakes": [
    "whole duck",
    "hoisin sauce",
    "mandarin pancakes",
    "cucumber",
    "spring onion",
  ],
  "Steamed Whole Fish": [
    "whole white fish",
    "ginger",
    "scallions",
    "soy sauce",
    "hot oil",
  ],
  "String Hoppers with Sambol": [
    "rice flour",
    "coconut milk",
    "grated coconut",
    "red chili",
    "lime",
  ],
  "Coconut Roti": [
    "wheat flour",
    "grated coconut",
    "water",
    "salt",
    "lunu miris",
  ],
  "Egg Hoppers": [
    "fermented rice batter",
    "eggs",
    "coconut oil",
    "sambol",
  ],
  "Fish Cutlets": [
    "white fish",
    "potato",
    "curry leaves",
    "breadcrumbs",
    "onion",
    "spices",
  ],
  "Dhal Curry": [
    "red lentils",
    "turmeric",
    "coconut milk",
    "mustard seeds",
    "curry leaves",
    "onion",
  ],
  "Jackfruit Mallung": [
    "young jackfruit",
    "grated coconut",
    "green chili",
    "lime",
  ],
  "Chicken Curry": [
    "chicken pieces",
    "Sri Lankan curry powder",
    "onion",
    "thin coconut milk",
    "thick coconut milk",
  ],
  "Fish Ambul Thiyal": [
    "tuna steaks",
    "goraka",
    "black pepper",
    "spice paste",
  ],
  "Wambatu Moju": [
    "eggplant",
    "sugar",
    "vinegar",
    "spices",
  ],
  "Gotu Kola Mallung": [
    "gotu kola leaves",
    "grated coconut",
    "onion",
    "green chili",
    "lime",
  ],
  "Lamprais": [
    "rice",
    "meat curry",
    "frikkadel",
    "sambol",
    "banana leaf",
  ],
  "Devilled Prawns": [
    "prawns",
    "tomato",
    "chili",
    "ketchup",
    "spring onion",
  ],
  "Masala Dosa": [
    "dosa batter",
    "potatoes",
    "mustard seeds",
    "curry leaves",
    "turmeric",
    "coconut chutney",
  ],
  "Poha": [
    "thick poha",
    "peanuts",
    "mustard seeds",
    "turmeric",
    "coriander",
    "lemon",
  ],
  "Egg Bhurji": [
    "eggs",
    "onion",
    "tomato",
    "green chili",
    "garam masala",
  ],
  "Chicken Keema Pav": [
    "minced chicken",
    "ginger-garlic",
    "tomato",
    "pav rolls",
    "butter",
  ],
  "Dal Tadka": [
    "toor dal",
    "turmeric",
    "ghee",
    "cumin",
    "garlic",
    "dried chili",
  ],
  "Paneer Butter Masala": [
    "paneer",
    "tomato",
    "onion",
    "cream",
    "butter",
    "garam masala",
  ],
  "Chicken Biryani": [
    "basmati rice",
    "chicken",
    "yogurt",
    "biryani masala",
    "saffron",
    "fried onions",
  ],
  "Fish Curry (Coastal)": [
    "white fish",
    "coconut",
    "tamarind",
    "curry leaves",
    "chili",
  ],
  "Palak Paneer": [
    "spinach",
    "paneer",
    "onion",
    "tomato",
    "cream",
    "garam masala",
  ],
  "Vegetable Biryani": [
    "basmati rice",
    "mixed vegetables",
    "biryani masala",
    "fried onions",
    "saffron",
  ],
  "Butter Chicken": [
    "chicken",
    "yogurt",
    "tomato",
    "butter",
    "cream",
    "kasuri methi",
  ],
  "Lamb Rogan Josh": [
    "lamb",
    "Kashmiri chili",
    "yogurt",
    "fennel",
    "ginger",
  ],
};

export function getDishIngredients(dishName: string): string[] {
  return DISH_INGREDIENTS[dishName] ?? [];
}

/** Parse ingredients JSON from DB (array or JSON string). */
export function parseDishIngredients(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        );
      }
    } catch {
      return [];
    }
  }
  return [];
}

/** DB ingredients when present, otherwise static list by dish name. */
export function resolveDishIngredients(dish: {
  dishName: string;
  ingredients?: string[] | null;
}): string[] {
  const fromDb = dish.ingredients?.filter(Boolean) ?? [];
  if (fromDb.length > 0) return fromDb;
  return getDishIngredients(dish.dishName);
}
