CREATE TABLE IF NOT EXISTS "cuisines" (
  "cuisine_id" text PRIMARY KEY NOT NULL,
  "cuisine_name" text NOT NULL,
  "image_url" text NOT NULL,
  "short_description" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "dishes" (
  "dish_id" text PRIMARY KEY NOT NULL,
  "cuisine_id" text NOT NULL REFERENCES "cuisines"("cuisine_id") ON DELETE CASCADE,
  "dish_name" text NOT NULL,
  "description" text NOT NULL,
  "meal_type" text NOT NULL,
  "dish_type" text NOT NULL,
  "image_url" text NOT NULL,
  "prep_time" integer NOT NULL,
  "cooking_time" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "dish_steps" (
  "step_id" serial PRIMARY KEY NOT NULL,
  "dish_id" text NOT NULL REFERENCES "dishes"("dish_id") ON DELETE CASCADE,
  "step_number" integer NOT NULL,
  "title" text NOT NULL,
  "instruction" text NOT NULL,
  "break_time_minutes" integer DEFAULT 0 NOT NULL,
  "timer_required" boolean DEFAULT false NOT NULL,
  "timer_minutes" integer
);

CREATE TABLE IF NOT EXISTS "saved_dishes" (
  "id" serial PRIMARY KEY NOT NULL,
  "dish_id" text NOT NULL,
  "saved_at" timestamp DEFAULT now() NOT NULL
);

DROP TABLE IF EXISTS "saved_recipes";
DROP TABLE IF EXISTS "recipes";
