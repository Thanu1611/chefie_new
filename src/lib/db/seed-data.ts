import type { MealType, DishType } from "@/types/dish";
import { getDishImageUrl } from "@/lib/dishes/dish-images";

const CHINESE_IMG = "/dishes/vegetable-fried-rice.jpg";
const INDIAN_IMG = "/dishes/masala-dosa.jpg";
const SRI_IMG = "/dishes/lamprais.jpg";

export const CUISINE_SEED = [
  {
    cuisineId: "chinese",
    cuisineName: "Chinese",
    imageUrl: CHINESE_IMG,
    shortDescription: "Wok-fired classics, dim sum, and comforting noodle bowls.",
  },
  {
    cuisineId: "sri_lankan",
    cuisineName: "Sri Lankan",
    imageUrl: SRI_IMG,
    shortDescription: "Island curries, hoppers, and bold sambols with coconut warmth.",
  },
  {
    cuisineId: "indian",
    cuisineName: "Indian",
    imageUrl: INDIAN_IMG,
    shortDescription: "Aromatic spices, biryanis, dals, and tandoor favorites.",
  },
] as const;

type DishSeed = {
  dishName: string;
  description: string;
  prepTime: number;
  cookingTime: number;
  imageUrl?: string;
  steps: {
    title: string;
    instruction: string;
    breakTimeMinutes?: number;
    timerRequired?: boolean;
    timerMinutes?: number;
  }[];
};

const DISH_CATALOG: Record<
  string,
  Record<MealType, Record<DishType, [DishSeed, DishSeed]>>
> = {
  chinese: {
    Breakfast: {
      Veg: [
        {
          dishName: "Congee with Greens",
          description: "Silky rice porridge topped with ginger, soy, and fresh bok choy.",
          prepTime: 10,
          cookingTime: 35,
          steps: [
            { title: "Rinse rice", instruction: "Rinse jasmine rice until water runs clear.", breakTimeMinutes: 0 },
            { title: "Simmer", instruction: "Simmer rice in broth, stirring often, until creamy.", timerRequired: true, timerMinutes: 30 },
            { title: "Blanch greens", instruction: "Blanch bok choy for 1 minute and drain.", timerRequired: true, timerMinutes: 1 },
            { title: "Season", instruction: "Stir in ginger, white pepper, and a splash of soy sauce.", breakTimeMinutes: 2 },
            { title: "Serve", instruction: "Ladle into bowls and top with greens and sesame oil." },
          ],
        },
        {
          dishName: "Steamed Vegetable Buns",
          description: "Soft mantou filled with seasoned cabbage and mushrooms.",
          prepTime: 25,
          cookingTime: 20,
          steps: [
            { title: "Make filling", instruction: "Sauté cabbage, carrots, and mushrooms with soy and sesame oil.", timerRequired: true, timerMinutes: 8 },
            { title: "Shape buns", instruction: "Wrap filling in dough rounds and pinch tops closed.", breakTimeMinutes: 10 },
            { title: "Proof", instruction: "Rest buns until slightly puffy.", timerRequired: true, timerMinutes: 15 },
            { title: "Steam", instruction: "Steam on parchment until fluffy and cooked through.", timerRequired: true, timerMinutes: 12 },
            { title: "Serve hot", instruction: "Serve immediately with chili oil on the side." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Egg Jianbing",
          description: "Crispy crepe with egg, scallions, and savory sauce.",
          prepTime: 15,
          cookingTime: 12,
          steps: [
            { title: "Mix batter", instruction: "Whisk mung bean flour batter until smooth.", breakTimeMinutes: 5 },
            { title: "Cook crepe", instruction: "Spread batter on hot griddle and cook until set.", timerRequired: true, timerMinutes: 3 },
            { title: "Add egg", instruction: "Crack egg over crepe and spread evenly.", timerRequired: true, timerMinutes: 2 },
            { title: "Fold", instruction: "Add sauce, crackers, and fold into a parcel.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Cut in half and serve warm." },
          ],
        },
        {
          dishName: "Chicken Congee",
          description: "Comforting chicken rice porridge with ginger and spring onion.",
          prepTime: 15,
          cookingTime: 40,
          steps: [
            { title: "Poach chicken", instruction: "Poach chicken breast with ginger until just cooked.", timerRequired: true, timerMinutes: 15 },
            { title: "Shred", instruction: "Shred chicken and reserve warm broth.", breakTimeMinutes: 5 },
            { title: "Cook congee", instruction: "Simmer rice in broth until thick and silky.", timerRequired: true, timerMinutes: 25 },
            { title: "Combine", instruction: "Stir shredded chicken back into congee.", breakTimeMinutes: 2 },
            { title: "Garnish", instruction: "Top with spring onion and white pepper." },
          ],
        },
      ],
    },
    Lunch: {
      Veg: [
        {
          dishName: "Mapo Tofu (Vegetarian)",
          description: "Silken tofu in spicy bean sauce with Sichuan pepper.",
          prepTime: 15,
          cookingTime: 20,
          steps: [
            { title: "Prep tofu", instruction: "Cut tofu into cubes and blanch gently.", timerRequired: true, timerMinutes: 2 },
            { title: "Fry aromatics", instruction: "Fry garlic, ginger, and doubanjiang until fragrant.", timerRequired: true, timerMinutes: 3 },
            { title: "Simmer", instruction: "Add stock and simmer sauce.", timerRequired: true, timerMinutes: 5 },
            { title: "Add tofu", instruction: "Slide in tofu and simmer without breaking.", timerRequired: true, timerMinutes: 8 },
            { title: "Finish", instruction: "Thicken, add peppercorn oil, and garnish with scallions." },
          ],
        },
        {
          dishName: "Vegetable Fried Rice",
          description: "Wok-tossed rice with peas, carrots, and soy aroma.",
          prepTime: 10,
          cookingTime: 15,
          steps: [
            { title: "Prep rice", instruction: "Use day-old cold rice for best texture.", breakTimeMinutes: 0 },
            { title: "Stir-fry veg", instruction: "High heat stir-fry carrots and peas.", timerRequired: true, timerMinutes: 3 },
            { title: "Toast rice", instruction: "Add rice and toss until grains separate.", timerRequired: true, timerMinutes: 5 },
            { title: "Season", instruction: "Add soy sauce and sesame oil off heat.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve immediately from the wok." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Kung Pao Chicken",
          description: "Stir-fried chicken with peanuts and dried chilies.",
          prepTime: 20,
          cookingTime: 25,
          steps: [
            { title: "Marinate", instruction: "Marinate diced chicken with soy and cornstarch.", timerRequired: true, timerMinutes: 15 },
            { title: "Fry chilies", instruction: "Fry dried chilies and Sichuan pepper until aromatic.", timerRequired: true, timerMinutes: 2 },
            { title: "Cook chicken", instruction: "Stir-fry chicken until golden.", timerRequired: true, timerMinutes: 6 },
            { title: "Add sauce", instruction: "Pour in vinegar-soy sauce and toss.", timerRequired: true, timerMinutes: 3 },
            { title: "Finish", instruction: "Add roasted peanuts and serve with rice." },
          ],
        },
        {
          dishName: "Sweet and Sour Pork",
          description: "Crispy pork bites in tangy bell pepper sauce.",
          prepTime: 20,
          cookingTime: 30,
          steps: [
            { title: "Coat pork", instruction: "Toss pork pieces in seasoned cornstarch.", breakTimeMinutes: 5 },
            { title: "Fry", instruction: "Deep fry until golden and crisp.", timerRequired: true, timerMinutes: 8 },
            { title: "Make sauce", instruction: "Simmer vinegar, sugar, ketchup, and pineapple juice.", timerRequired: true, timerMinutes: 6 },
            { title: "Combine", instruction: "Toss pork with peppers and sauce.", timerRequired: true, timerMinutes: 3 },
            { title: "Serve", instruction: "Serve hot over steamed rice." },
          ],
        },
      ],
    },
    Dinner: {
      Veg: [
        {
          dishName: "Buddha's Delight",
          description: "Mixed vegetables and tofu braised in light soy broth.",
          prepTime: 20,
          cookingTime: 25,
          steps: [
            { title: "Soak mushrooms", instruction: "Rehydrate shiitake in warm water.", timerRequired: true, timerMinutes: 20 },
            { title: "Stir-fry", instruction: "Stir-fry tofu and vegetables separately.", timerRequired: true, timerMinutes: 8 },
            { title: "Braise", instruction: "Combine with broth and simmer gently.", timerRequired: true, timerMinutes: 12 },
            { title: "Thicken", instruction: "Add cornstarch slurry to gloss the sauce.", timerRequired: true, timerMinutes: 2 },
            { title: "Serve", instruction: "Garnish with sesame and serve family style." },
          ],
        },
        {
          dishName: "Dan Dan Noodles (Veg)",
          description: "Noodles with spicy sesame sauce and preserved vegetables.",
          prepTime: 15,
          cookingTime: 15,
          steps: [
            { title: "Make sauce", instruction: "Whisk chili oil, tahini, soy, and vinegar.", breakTimeMinutes: 0 },
            { title: "Cook noodles", instruction: "Boil wheat noodles until al dente.", timerRequired: true, timerMinutes: 6 },
            { title: "Prep toppings", instruction: "Pan-fry mushrooms and pickled mustard greens.", timerRequired: true, timerMinutes: 5 },
            { title: "Assemble", instruction: "Toss noodles with sauce and toppings.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Top with crushed peanuts and scallions." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Peking Duck Pancakes",
          description: "Crispy duck skin served with pancakes and hoisin.",
          prepTime: 30,
          cookingTime: 90,
          steps: [
            { title: "Dry duck", instruction: "Air-dry seasoned duck skin until taut.", timerRequired: true, timerMinutes: 60 },
            { title: "Roast", instruction: "Roast at high heat until skin is lacquered.", timerRequired: true, timerMinutes: 45 },
            { title: "Rest", instruction: "Rest duck before carving.", timerRequired: true, timerMinutes: 15 },
            { title: "Carve", instruction: "Slice skin and meat for wrapping.", breakTimeMinutes: 5 },
            { title: "Serve", instruction: "Serve with pancakes, cucumber, and hoisin." },
          ],
        },
        {
          dishName: "Steamed Whole Fish",
          description: "Ginger-scallion fish steamed until silky and tender.",
          prepTime: 15,
          cookingTime: 20,
          steps: [
            { title: "Prep fish", instruction: "Score fish and stuff with ginger slices.", breakTimeMinutes: 5 },
            { title: "Steam", instruction: "Steam on high until flesh flakes.", timerRequired: true, timerMinutes: 12 },
            { title: "Make oil", instruction: "Heat oil with scallions until fragrant.", timerRequired: true, timerMinutes: 2 },
            { title: "Dress", instruction: "Pour hot oil and soy over fish.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve immediately with rice." },
          ],
        },
      ],
    },
  },
  sri_lankan: {
    Breakfast: {
      Veg: [
        {
          dishName: "String Hoppers with Sambol",
          description: "Steamed rice noodle nests with coconut and chili sambol.",
          prepTime: 20,
          cookingTime: 25,
          steps: [
            { title: "Mix batter", instruction: "Combine rice flour and coconut milk to a thick batter.", breakTimeMinutes: 5 },
            { title: "Press noodles", instruction: "Press batter into hopper molds.", breakTimeMinutes: 10 },
            { title: "Steam", instruction: "Steam until firm and glossy.", timerRequired: true, timerMinutes: 8 },
            { title: "Make sambol", instruction: "Grind coconut, chili, and lime for sambol.", breakTimeMinutes: 5 },
            { title: "Serve", instruction: "Serve hoppers warm with sambol on the side." },
          ],
        },
        {
          dishName: "Coconut Roti",
          description: "Pan-fried coconut flatbread served with lunu miris.",
          prepTime: 15,
          cookingTime: 20,
          steps: [
            { title: "Knead dough", instruction: "Knead flour, coconut, and water until soft.", breakTimeMinutes: 10 },
            { title: "Rest", instruction: "Cover and rest dough.", timerRequired: true, timerMinutes: 15 },
            { title: "Shape", instruction: "Divide and roll into thick rounds.", breakTimeMinutes: 5 },
            { title: "Cook", instruction: "Pan-fry until golden spots appear.", timerRequired: true, timerMinutes: 12 },
            { title: "Serve", instruction: "Serve with lunu miris and tea." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Egg Hoppers",
          description: "Bowl-shaped crepes with a soft egg center.",
          prepTime: 30,
          cookingTime: 20,
          steps: [
            { title: "Ferment batter", instruction: "Rest fermented rice batter until bubbly.", timerRequired: true, timerMinutes: 120 },
            { title: "Heat pan", instruction: "Heat hopper pan with a swirl of oil.", timerRequired: true, timerMinutes: 3 },
            { title: "Swirl batter", instruction: "Coat sides thinly and crack egg in center.", timerRequired: true, timerMinutes: 4 },
            { title: "Cover", instruction: "Cover and cook until egg sets.", timerRequired: true, timerMinutes: 4 },
            { title: "Serve", instruction: "Serve with sambol and curry on the side." },
          ],
        },
        {
          dishName: "Fish Cutlets",
          description: "Spiced fish potato croquettes fried until crisp.",
          prepTime: 25,
          cookingTime: 20,
          steps: [
            { title: "Cook fish", instruction: "Poach fish with curry leaves and flake.", timerRequired: true, timerMinutes: 10 },
            { title: "Mix filling", instruction: "Combine fish, potato, and spices.", breakTimeMinutes: 10 },
            { title: "Shape", instruction: "Form ovals and coat in breadcrumbs.", breakTimeMinutes: 10 },
            { title: "Chill", instruction: "Chill cutlets to hold shape.", timerRequired: true, timerMinutes: 20 },
            { title: "Fry", instruction: "Deep fry until golden brown.", timerRequired: true, timerMinutes: 6 },
          ],
        },
      ],
    },
    Lunch: {
      Veg: [
        {
          dishName: "Dhal Curry",
          description: "Red lentils simmered with coconut milk and curry leaves.",
          prepTime: 10,
          cookingTime: 30,
          steps: [
            { title: "Rinse lentils", instruction: "Wash red lentils until water is clear.", breakTimeMinutes: 0 },
            { title: "Simmer", instruction: "Simmer lentils with turmeric until soft.", timerRequired: true, timerMinutes: 20 },
            { title: "Temper", instruction: "Fry mustard seeds, curry leaves, and onion.", timerRequired: true, timerMinutes: 5 },
            { title: "Combine", instruction: "Stir tempered spices and coconut milk into dal.", timerRequired: true, timerMinutes: 5 },
            { title: "Serve", instruction: "Serve with rice and mallung." },
          ],
        },
        {
          dishName: "Jackfruit Mallung",
          description: "Stir-fried young jackfruit with coconut and lime.",
          prepTime: 15,
          cookingTime: 20,
          steps: [
            { title: "Prep jackfruit", instruction: "Boil young jackfruit until tender.", timerRequired: true, timerMinutes: 15 },
            { title: "Shred", instruction: "Shred jackfruit and drain well.", breakTimeMinutes: 3 },
            { title: "Stir-fry", instruction: "Toss with grated coconut and green chili.", timerRequired: true, timerMinutes: 6 },
            { title: "Season", instruction: "Finish with lime juice and salt.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve warm as a side with rice." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Chicken Curry",
          description: "Dark roasted Sri Lankan chicken curry with coconut.",
          prepTime: 20,
          cookingTime: 45,
          steps: [
            { title: "Roast spices", instruction: "Dry roast curry powder with onion.", timerRequired: true, timerMinutes: 8 },
            { title: "Brown chicken", instruction: "Brown chicken pieces in the pan.", timerRequired: true, timerMinutes: 10 },
            { title: "Simmer", instruction: "Add thin coconut milk and simmer covered.", timerRequired: true, timerMinutes: 20 },
            { title: "Thicken", instruction: "Add thick coconut milk and reduce.", timerRequired: true, timerMinutes: 10 },
            { title: "Serve", instruction: "Serve with rice and pol sambol." },
          ],
        },
        {
          dishName: "Fish Ambul Thiyal",
          description: "Sour black pepper fish curry from the southern coast.",
          prepTime: 15,
          cookingTime: 35,
          steps: [
            { title: "Make paste", instruction: "Simmer goraka, pepper, and spices into a paste.", timerRequired: true, timerMinutes: 10 },
            { title: "Add fish", instruction: "Nestle tuna steaks into the paste.", breakTimeMinutes: 5 },
            { title: "Cook gently", instruction: "Cook on low without stirring much.", timerRequired: true, timerMinutes: 15 },
            { title: "Reduce", instruction: "Reduce until gravy coats the fish.", timerRequired: true, timerMinutes: 8 },
            { title: "Serve", instruction: "Serve at room temperature with rice." },
          ],
        },
      ],
    },
    Dinner: {
      Veg: [
        {
          dishName: "Wambatu Moju",
          description: "Sweet-sour caramelized eggplant pickle served warm.",
          prepTime: 15,
          cookingTime: 30,
          steps: [
            { title: "Fry eggplant", instruction: "Shallow fry eggplant until golden.", timerRequired: true, timerMinutes: 12 },
            { title: "Caramelize", instruction: "Cook sugar, vinegar, and spices to a glaze.", timerRequired: true, timerMinutes: 8 },
            { title: "Combine", instruction: "Toss eggplant in the sweet-sour glaze.", timerRequired: true, timerMinutes: 5 },
            { title: "Rest", instruction: "Rest flavors together.", timerRequired: true, timerMinutes: 5 },
            { title: "Serve", instruction: "Serve with rice and papadam." },
          ],
        },
        {
          dishName: "Gotu Kola Mallung",
          description: "Fresh gotu kola leaves tossed with coconut and lime.",
          prepTime: 10,
          cookingTime: 8,
          steps: [
            { title: "Wash leaves", instruction: "Wash and finely chop gotu kola.", breakTimeMinutes: 5 },
            { title: "Toast coconut", instruction: "Lightly toast grated coconut.", timerRequired: true, timerMinutes: 3 },
            { title: "Mix", instruction: "Toss leaves with coconut, onion, and chili.", breakTimeMinutes: 2 },
            { title: "Season", instruction: "Add lime juice and salt to taste.", breakTimeMinutes: 0 },
            { title: "Serve", instruction: "Serve immediately as a fresh side." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Lamprais",
          description: "Banana-leaf rice parcel with meat, sambol, and frikkadel.",
          prepTime: 40,
          cookingTime: 90,
          steps: [
            { title: "Cook components", instruction: "Prepare rice, curry, and frikkadel separately.", timerRequired: true, timerMinutes: 60 },
            { title: "Layer", instruction: "Layer rice and curries on banana leaf.", breakTimeMinutes: 15 },
            { title: "Wrap", instruction: "Fold leaf parcel securely.", breakTimeMinutes: 5 },
            { title: "Bake", instruction: "Bake parcels until aromas meld.", timerRequired: true, timerMinutes: 35 },
            { title: "Serve", instruction: "Open at the table and serve hot." },
          ],
        },
        {
          dishName: "Devilled Prawns",
          description: "Prawns tossed in sweet-spicy tomato chili glaze.",
          prepTime: 15,
          cookingTime: 15,
          steps: [
            { title: "Prep prawns", instruction: "Clean and pat prawns dry.", breakTimeMinutes: 5 },
            { title: "Make sauce", instruction: "Cook tomato, chili, and ketchup until thick.", timerRequired: true, timerMinutes: 6 },
            { title: "Sear prawns", instruction: "Quick sear prawns until pink.", timerRequired: true, timerMinutes: 4 },
            { title: "Toss", instruction: "Coat prawns in devilled sauce.", timerRequired: true, timerMinutes: 2 },
            { title: "Serve", instruction: "Garnish with spring onion and serve." },
          ],
        },
      ],
    },
  },
  indian: {
    Breakfast: {
      Veg: [
        {
          dishName: "Masala Dosa",
          description: "Crispy fermented crepe filled with spiced potato.",
          prepTime: 20,
          cookingTime: 25,
          steps: [
            { title: "Prep batter", instruction: "Stir fermented dosa batter gently.", breakTimeMinutes: 5 },
            { title: "Make filling", instruction: "Sauté mustard, curry leaves, and potato masala.", timerRequired: true, timerMinutes: 12 },
            { title: "Cook dosa", instruction: "Spread batter thin and drizzle oil until crisp.", timerRequired: true, timerMinutes: 4 },
            { title: "Fill", instruction: "Place masala in center and fold dosa.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve with coconut chutney and sambar." },
          ],
        },
        {
          dishName: "Curd Rice",
          description:
            "Creamy South Indian thayir sadam with yogurt, tempering, and pomegranate garnish.",
          prepTime: 10,
          cookingTime: 25,
          imageUrl: "/dishes/curd-rice.jpg",
          steps: [
            {
              title: "Cook rice",
              instruction: "Cook short-grain rice very soft with extra water until mashable.",
              timerRequired: true,
              timerMinutes: 20,
            },
            {
              title: "Cool and mash",
              instruction: "Cool rice slightly and mash gently until creamy.",
              breakTimeMinutes: 10,
            },
            {
              title: "Mix curd",
              instruction: "Fold in fresh yogurt, salt, and a little milk until smooth.",
              breakTimeMinutes: 2,
            },
            {
              title: "Temper",
              instruction: "Fry mustard seeds, urad dal, curry leaves, and green chili in ghee.",
              timerRequired: true,
              timerMinutes: 3,
            },
            {
              title: "Serve",
              instruction: "Pour tempering over rice; top with pomegranate and coriander.",
            },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Egg Bhurji",
          description: "Soft scrambled eggs with onion, tomato, and masala.",
          prepTime: 10,
          cookingTime: 12,
          steps: [
            { title: "Sauté base", instruction: "Cook onion, tomato, and green chili.", timerRequired: true, timerMinutes: 6 },
            { title: "Add spices", instruction: "Stir in turmeric, chili, and garam masala.", breakTimeMinutes: 1 },
            { title: "Scramble", instruction: "Add beaten eggs and scramble gently.", timerRequired: true, timerMinutes: 4 },
            { title: "Finish", instruction: "Cook until just set and moist.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve with buttered pav or paratha." },
          ],
        },
        {
          dishName: "Chicken Keema Pav",
          description: "Spiced minced chicken served with buttered pav rolls.",
          prepTime: 15,
          cookingTime: 25,
          steps: [
            { title: "Brown keema", instruction: "Cook minced chicken with ginger-garlic.", timerRequired: true, timerMinutes: 8 },
            { title: "Simmer", instruction: "Add tomato and spices; simmer until thick.", timerRequired: true, timerMinutes: 12 },
            { title: "Toast pav", instruction: "Butter and toast pav on griddle.", timerRequired: true, timerMinutes: 3 },
            { title: "Garnish", instruction: "Top keema with coriander and lime.", breakTimeMinutes: 1 },
            { title: "Serve", instruction: "Serve keema with hot pav and onions." },
          ],
        },
      ],
    },
    Lunch: {
      Veg: [
        {
          dishName: "Dal Tadka",
          description: "Yellow lentils finished with ghee, cumin, and garlic tempering.",
          prepTime: 10,
          cookingTime: 35,
          steps: [
            { title: "Cook dal", instruction: "Pressure cook toor dal with turmeric.", timerRequired: true, timerMinutes: 20 },
            { title: "Mash", instruction: "Whisk dal smooth and adjust consistency.", breakTimeMinutes: 2 },
            { title: "Temper", instruction: "Fry cumin, garlic, and dried chili in ghee.", timerRequired: true, timerMinutes: 4 },
            { title: "Combine", instruction: "Pour tadka over dal and simmer.", timerRequired: true, timerMinutes: 5 },
            { title: "Serve", instruction: "Serve with jeera rice and pickle." },
          ],
        },
        {
          dishName: "Paneer Butter Masala",
          description: "Paneer in creamy tomato butter sauce.",
          prepTime: 20,
          cookingTime: 30,
          steps: [
            { title: "Sauté base", instruction: "Cook onion-tomato puree with spices.", timerRequired: true, timerMinutes: 12 },
            { title: "Blend", instruction: "Blend sauce until silky smooth.", breakTimeMinutes: 3 },
            { title: "Simmer", instruction: "Simmer with cream and butter.", timerRequired: true, timerMinutes: 10 },
            { title: "Add paneer", instruction: "Add paneer cubes and simmer gently.", timerRequired: true, timerMinutes: 5 },
            { title: "Serve", instruction: "Garnish with cream and fenugreek leaves." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Chicken Biryani",
          description: "Fragrant layered rice with marinated chicken and saffron.",
          prepTime: 40,
          cookingTime: 60,
          steps: [
            { title: "Marinate", instruction: "Marinate chicken with yogurt and biryani masala.", timerRequired: true, timerMinutes: 30 },
            { title: "Parboil rice", instruction: "Parboil basmati with whole spices.", timerRequired: true, timerMinutes: 10 },
            { title: "Layer", instruction: "Layer rice and chicken with herbs.", breakTimeMinutes: 10 },
            { title: "Dum cook", instruction: "Seal pot and cook on low heat.", timerRequired: true, timerMinutes: 35 },
            { title: "Serve", instruction: "Rest 10 minutes, then fluff and serve.", timerRequired: true, timerMinutes: 10 },
          ],
        },
        {
          dishName: "Fish Curry (Coastal)",
          description: "Tamarind coconut fish curry with curry leaves.",
          prepTime: 15,
          cookingTime: 25,
          steps: [
            { title: "Make masala", instruction: "Grind coconut, chili, and tamarind base.", breakTimeMinutes: 5 },
            { title: "Simmer sauce", instruction: "Cook masala with water until fragrant.", timerRequired: true, timerMinutes: 10 },
            { title: "Add fish", instruction: "Slide fish pieces into curry gently.", timerRequired: true, timerMinutes: 8 },
            { title: "Finish", instruction: "Swirl coconut oil and curry leaves.", breakTimeMinutes: 2 },
            { title: "Serve", instruction: "Serve with steamed rice." },
          ],
        },
      ],
    },
    Dinner: {
      Veg: [
        {
          dishName: "Palak Paneer",
          description: "Cottage cheese in spiced spinach gravy.",
          prepTime: 20,
          cookingTime: 25,
          steps: [
            { title: "Blanch spinach", instruction: "Blanch spinach and blend smooth.", timerRequired: true, timerMinutes: 5 },
            { title: "Make gravy", instruction: "Cook onion-tomato masala base.", timerRequired: true, timerMinutes: 10 },
            { title: "Add spinach", instruction: "Stir in spinach purée and simmer.", timerRequired: true, timerMinutes: 8 },
            { title: "Add paneer", instruction: "Add paneer and cream; simmer gently.", timerRequired: true, timerMinutes: 5 },
            { title: "Serve", instruction: "Serve hot with naan or roti." },
          ],
        },
        {
          dishName: "Vegetable Biryani",
          description: "Layered vegetable biryani with fried onions and saffron.",
          prepTime: 35,
          cookingTime: 50,
          steps: [
            { title: "Cook veg", instruction: "Cook spiced vegetables until tender.", timerRequired: true, timerMinutes: 15 },
            { title: "Parboil rice", instruction: "Parboil rice with whole spices.", timerRequired: true, timerMinutes: 10 },
            { title: "Layer", instruction: "Layer rice, vegetables, and fried onions.", breakTimeMinutes: 10 },
            { title: "Dum", instruction: "Dum cook on low until aromatic.", timerRequired: true, timerMinutes: 30 },
            { title: "Serve", instruction: "Serve with raita and salad." },
          ],
        },
      ],
      "Non-Veg": [
        {
          dishName: "Butter Chicken",
          description: "Tandoori-style chicken in creamy tomato makhani sauce.",
          prepTime: 30,
          cookingTime: 45,
          steps: [
            { title: "Marinate", instruction: "Marinate chicken in yogurt and spices.", timerRequired: true, timerMinutes: 30 },
            { title: "Grill", instruction: "Char chicken in oven or pan.", timerRequired: true, timerMinutes: 12 },
            { title: "Make sauce", instruction: "Simmer tomato, butter, and cream sauce.", timerRequired: true, timerMinutes: 15 },
            { title: "Combine", instruction: "Add chicken and simmer together.", timerRequired: true, timerMinutes: 10 },
            { title: "Serve", instruction: "Finish with butter and serve with naan." },
          ],
        },
        {
          dishName: "Lamb Rogan Josh",
          description: "Kashmiri lamb curry with aromatic red gravy.",
          prepTime: 25,
          cookingTime: 90,
          steps: [
            { title: "Brown lamb", instruction: "Brown lamb pieces in oil.", timerRequired: true, timerMinutes: 12 },
            { title: "Bloom spices", instruction: "Add Kashmiri chili and yogurt slowly.", timerRequired: true, timerMinutes: 10 },
            { title: "Braise", instruction: "Braise covered until lamb is tender.", timerRequired: true, timerMinutes: 60 },
            { title: "Reduce", instruction: "Uncover and reduce gravy.", timerRequired: true, timerMinutes: 10 },
            { title: "Serve", instruction: "Serve with steamed basmati rice." },
          ],
        },
      ],
    },
  },
};

export function buildDishSeeds() {
  const dishes: {
    dishId: string;
    cuisineId: string;
    dishName: string;
    description: string;
    mealType: MealType;
    dishType: DishType;
    imageUrl: string;
    prepTime: number;
    cookingTime: number;
    steps: DishSeed["steps"];
  }[] = [];

  for (const [cuisineId, meals] of Object.entries(DISH_CATALOG)) {
    for (const [mealType, types] of Object.entries(meals) as [
      MealType,
      Record<DishType, [DishSeed, DishSeed]>,
    ][]) {
      for (const [dishType, pair] of Object.entries(types) as [
        DishType,
        [DishSeed, DishSeed],
      ][]) {
        pair.forEach((dish, index) => {
          const slug = dish.dishName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          dishes.push({
            dishId: `${cuisineId}-${mealType.toLowerCase()}-${dishType.toLowerCase()}-${index + 1}-${slug}`,
            cuisineId,
            dishName: dish.dishName,
            description: dish.description,
            mealType,
            dishType,
            imageUrl: dish.imageUrl ?? getDishImageUrl(dish.dishName),
            prepTime: dish.prepTime,
            cookingTime: dish.cookingTime,
            steps: dish.steps,
          });
        });
      }
    }
  }

  return dishes;
}
