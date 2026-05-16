-- Run in Supabase SQL Editor if dish_ingredients insert fails (RLS)

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id serial PRIMARY KEY,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity numeric,
  unit text,
  display_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dish_ingredients_select ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_insert ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_update ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_delete ON dish_ingredients;

CREATE POLICY dish_ingredients_select ON dish_ingredients FOR SELECT USING (true);
CREATE POLICY dish_ingredients_insert ON dish_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY dish_ingredients_update ON dish_ingredients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY dish_ingredients_delete ON dish_ingredients FOR DELETE USING (true);

GRANT ALL ON dish_ingredients TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE dish_ingredients_id_seq TO anon, authenticated, service_role;
