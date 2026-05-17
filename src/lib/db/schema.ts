import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const cuisines = pgTable("cuisines", {
  cuisineId: text("cuisine_id").primaryKey(),
  cuisineName: text("cuisine_name").notNull(),
  imageUrl: text("image_url").notNull(),
  shortDescription: text("short_description").notNull(),
});

export const dishes = pgTable("dishes", {
  dishId: text("dish_id").primaryKey(),
  cuisineId: text("cuisine_id")
    .notNull()
    .references(() => cuisines.cuisineId, { onDelete: "cascade" }),
  dishName: text("dish_name").notNull(),
  description: text("description").notNull(),
  mealType: text("meal_type").notNull(),
  dishType: text("dish_type").notNull(),
  imageUrl: text("image_url").notNull(),
  prepTime: integer("prep_time").notNull(),
  cookingTime: integer("cooking_time").notNull(),
  baseServings: integer("base_servings").notNull().default(2),
});

export const dishIngredients = pgTable("dish_ingredients", {
  id: serial("id").primaryKey(),
  dishId: text("dish_id")
    .notNull()
    .references(() => dishes.dishId, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: numeric("quantity"),
  unit: text("unit"),
  displayText: text("display_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dishSteps = pgTable("dish_steps", {
  stepId: serial("step_id").primaryKey(),
  dishId: text("dish_id")
    .notNull()
    .references(() => dishes.dishId, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  instruction: text("instruction").notNull(),
  breakTimeMinutes: integer("break_time_minutes").notNull().default(0),
  timerRequired: boolean("timer_required").notNull().default(false),
  timerMinutes: integer("timer_minutes"),
});

export const savedDishes = pgTable(
  "saved_dishes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    dishId: text("dish_id").notNull(),
    dishName: text("dish_name"),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.dishId)],
);

export const mealPlans = pgTable(
  "meal_plans",
  {
    planId: serial("plan_id").primaryKey(),
    userId: uuid("user_id").notNull(),
    planDate: date("plan_date").notNull(),
    mealType: text("meal_type").notNull(),
    dishId: text("dish_id")
      .notNull()
      .references(() => dishes.dishId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.planDate, t.mealType)],
);

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  planDate: date("plan_date").notNull(),
  ingredientName: text("ingredient_name").notNull(),
  quantity: text("quantity").notNull().default(""),
  isPurchased: boolean("is_purchased").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  shoppingListId: integer("shopping_list_id")
    .notNull()
    .references(() => shoppingLists.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: text("quantity").notNull().default(""),
  isPurchased: boolean("is_purchased").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shoppingListSources = pgTable(
  "shopping_list_sources",
  {
    id: serial("id").primaryKey(),
    shoppingListItemId: integer("shopping_list_item_id")
      .notNull()
      .references(() => shoppingListItems.id, { onDelete: "cascade" }),
    planId: integer("plan_id")
      .notNull()
      .references(() => mealPlans.planId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueItemPlan: unique().on(t.shoppingListItemId, t.planId),
  }),
);

export const cuisinesRelations = relations(cuisines, ({ many }) => ({
  dishes: many(dishes),
}));

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  cuisine: one(cuisines, {
    fields: [dishes.cuisineId],
    references: [cuisines.cuisineId],
  }),
  steps: many(dishSteps),
  mealPlans: many(mealPlans),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
  dish: one(dishes, {
    fields: [mealPlans.dishId],
    references: [dishes.dishId],
  }),
}));

export const dishStepsRelations = relations(dishSteps, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishSteps.dishId],
    references: [dishes.dishId],
  }),
}));
