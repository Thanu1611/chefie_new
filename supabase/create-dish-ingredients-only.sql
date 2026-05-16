-- Quick fix: run this entire script in Supabase → SQL Editor → Run

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id serial PRIMARY KEY,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity numeric,
  unit text,
  display_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dish_ingredients_dish_idx ON dish_ingredients (dish_id);

ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dish_ingredients_select ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_insert ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_update ON dish_ingredients;
DROP POLICY IF EXISTS dish_ingredients_delete ON dish_ingredients;

CREATE POLICY dish_ingredients_select ON dish_ingredients
  FOR SELECT TO public USING (true);
CREATE POLICY dish_ingredients_insert ON dish_ingredients
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY dish_ingredients_update ON dish_ingredients
  FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY dish_ingredients_delete ON dish_ingredients
  FOR DELETE TO public USING (true);

GRANT ALL ON dish_ingredients TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE dish_ingredients_id_seq TO anon, authenticated, service_role;

-- Refresh API schema cache (fixes "Could not find the table in the schema cache")
NOTIFY pgrst, 'reload schema';
