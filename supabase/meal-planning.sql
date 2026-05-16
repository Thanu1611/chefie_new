-- Run in Supabase SQL Editor (additive — does not drop existing tables)

CREATE TABLE IF NOT EXISTS meal_plans (
  plan_id serial PRIMARY KEY,
  plan_date date NOT NULL,
  meal_type text NOT NULL,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id serial PRIMARY KEY,
  plan_date date NOT NULL,
  ingredient_name text NOT NULL,
  quantity text NOT NULL DEFAULT '',
  purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_plans_date_idx ON meal_plans (plan_date);
CREATE INDEX IF NOT EXISTS shopping_lists_scope_idx ON shopping_lists (plan_date);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meal_plans_all ON meal_plans;
DROP POLICY IF EXISTS shopping_lists_all ON shopping_lists;

CREATE POLICY meal_plans_all ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY shopping_lists_all ON shopping_lists FOR ALL USING (true) WITH CHECK (true);
