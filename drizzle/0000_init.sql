CREATE TABLE IF NOT EXISTS "recipes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "external_id" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "cuisine" text NOT NULL,
  "image" text NOT NULL,
  "description" text,
  "cooking_time_minutes" integer NOT NULL,
  "difficulty" text NOT NULL,
  "servings" integer NOT NULL,
  "is_vegetarian" boolean DEFAULT false NOT NULL,
  "spicy_level" integer DEFAULT 0 NOT NULL,
  "ingredients" jsonb NOT NULL,
  "steps" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "saved_recipes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "recipe_id" text NOT NULL,
  "user_id" text,
  "saved_at" timestamp DEFAULT now() NOT NULL
);
