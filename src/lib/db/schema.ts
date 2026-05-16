import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id").notNull().unique(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  image: text("image").notNull(),
  description: text("description"),
  cookingTimeMinutes: integer("cooking_time_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  servings: integer("servings").notNull(),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  spicyLevel: integer("spicy_level").notNull().default(0),
  ingredients: jsonb("ingredients").notNull(),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedRecipes = pgTable("saved_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: text("recipe_id").notNull(),
  userId: text("user_id"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});
