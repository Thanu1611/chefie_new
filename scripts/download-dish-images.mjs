/**
 * Downloads curated dish photos to public/dishes/{slug}.jpg
 * Run: node scripts/download-dish-images.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "dishes");

const foodish = (category, n) =>
  `https://foodish-api.com/images/${category}/${category}${n}.jpg`;

/** Dish name → source URL (Pexels / Foodish / Unsplash / Wikimedia). */
const DISH_IMAGE_SOURCES = {
  // Chinese
  "Congee with Greens":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85",
  "Steamed Vegetable Buns":
    "https://images.pexels.com/photos/2253278/pexels-photo-2253278.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Egg Jianbing":
    "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Chicken Congee":
    "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Mapo Tofu (Vegetarian)":
    "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Vegetable Fried Rice":
    "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Kung Pao Chicken":
    "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Sweet and Sour Pork":
    "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85",
  "Buddha's Delight":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85",
  "Dan Dan Noodles (Veg)":
    "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Peking Duck Pancakes":
    "https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Steamed Whole Fish":
    "https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // Sri Lankan
  "String Hoppers with Sambol":
    "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Coconut Roti":
    "https://upload.wikimedia.org/wikipedia/commons/4/4e/Coconut_Roti.jpg",
  "Egg Hoppers":
    "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Fish Cutlets":
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=85",
  "Dhal Curry":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=85",
  "Jackfruit Mallung":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85",
  "Chicken Curry":
    "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Fish Ambul Thiyal":
    "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Wambatu Moju":
    "https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Gotu Kola Mallung":
    "https://images.pexels.com/photos/5317/food-salad-restaurant-person.jpg?auto=compress&cs=tinysrgb&w=1200",
  "Lamprais":
    "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Devilled Prawns":
    "https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // Indian
  "Masala Dosa":
    "https://images.unsplash.com/photo-1743615467204-8fdaa85ff2db?w=1200&q=85",
  "Curd Rice":
    "https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=1200&q=85",
  "Egg Bhurji":
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=85",
  "Chicken Keema Pav": foodish("samosa", 10),
  "Dal Tadka": foodish("rice", 8),
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=85",
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85",
  "Fish Curry (Coastal)":
    "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Palak Paneer":
    "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "Poha":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=85",
  "Vegetable Biryani": foodish("biryani", 25),
  "Butter Chicken":
    "https://images.unsplash.com/photo-1742599361498-79824d24e355?w=1200&q=85",
  "Lamb Rogan Josh": foodish("butter-chicken", 15),
};

function dishSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*,*/*",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`too small (${buf.length}b)`);
  writeFileSync(dest, buf);
}

mkdirSync(OUT_DIR, { recursive: true });

const mapping = {};
const sql = [
  "-- Auto-generated: update all dish images to local curated photos",
  "",
];

for (const [name, url] of Object.entries(DISH_IMAGE_SOURCES)) {
  const slug = dishSlug(name);
  const file = `${slug}.jpg`;
  const dest = join(OUT_DIR, file);
  const publicPath = `/dishes/${file}`;

  try {
    console.log(`download: ${name} → ${file}`);
    await download(url, dest);
    mapping[name] = publicPath;
  } catch (err) {
    console.error(`FAILED ${name}:`, err.message);
    if (existsSync(dest)) {
      mapping[name] = publicPath;
      console.log(`  kept existing ${file}`);
    }
  }
}

mapping["Thayir Sadam"] = mapping["Curd Rice"];
mapping["Thayir Saadam"] = mapping["Curd Rice"];

const ts = `/** Auto-generated by scripts/download-dish-images.mjs — do not edit by hand. */
export const DISH_IMAGE_PATHS: Record<string, string> = ${JSON.stringify(mapping, null, 2)};

export function dishImageSlug(dishName: string): string {
  return dishName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getLocalDishImagePath(dishName: string): string | undefined {
  if (DISH_IMAGE_PATHS[dishName]) return DISH_IMAGE_PATHS[dishName];
  const slug = dishImageSlug(dishName);
  return DISH_IMAGE_PATHS[Object.keys(DISH_IMAGE_PATHS).find(
    (k) => dishImageSlug(k) === slug,
  ) ?? ""];
}
`;

writeFileSync(
  join(__dirname, "..", "src", "lib", "dishes", "dish-image-paths.ts"),
  ts,
);

for (const [name, path] of Object.entries(mapping)) {
  if (name.startsWith("Thayir")) continue;
  sql.push(
    `UPDATE dishes SET image_url = '${path}' WHERE dish_name = '${name.replace(/'/g, "''")}';`,
  );
}

writeFileSync(
  join(__dirname, "..", "supabase", "update-all-dish-images.sql"),
  sql.join("\n") + "\n",
);

const ok = Object.keys(mapping).length;
const total = Object.keys(DISH_IMAGE_SOURCES).length;
console.log(`\nDone: ${ok}/${total} dishes mapped → public/dishes/`);
