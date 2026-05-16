-- Run in Supabase SQL Editor (safe to re-run)

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS base_servings integer NOT NULL DEFAULT 2;

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS servings integer NOT NULL DEFAULT 2;

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

NOTIFY pgrst, 'reload schema';

-- Seed: Congee with Greens (adjust dish_id if yours differs)
INSERT INTO dish_ingredients (dish_id, ingredient_name, quantity, unit, display_text)
SELECT d.dish_id, v.ingredient_name, v.quantity, v.unit, v.display_text
FROM dishes d
CROSS JOIN (
  VALUES
    ('jasmine rice', 1, 'cup', '1 cup jasmine rice'),
    ('chicken or vegetable broth', 4, 'cups', '4 cups chicken or vegetable broth'),
    ('bok choy', 1, 'bunch', '1 bunch bok choy'),
    ('fresh ginger', 1, 'tbsp', '1 tbsp fresh ginger'),
    ('soy sauce', 2, 'tbsp', '2 tbsp soy sauce'),
    ('white pepper', 0.5, 'tsp', '½ tsp white pepper'),
    ('sesame oil', 1, 'tsp', '1 tsp sesame oil')
) AS v(ingredient_name, quantity, unit, display_text)
WHERE d.dish_name = 'Congee with Greens'
  AND NOT EXISTS (
    SELECT 1 FROM dish_ingredients di WHERE di.dish_id = d.dish_id LIMIT 1
  );
