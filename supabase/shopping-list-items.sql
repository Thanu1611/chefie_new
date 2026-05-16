-- Run in Supabase SQL Editor if you use the normalized shopping list schema

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id serial PRIMARY KEY,
  shopping_list_id int4 NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity text NOT NULL DEFAULT '',
  is_purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shopping_list_items_list_idx ON shopping_list_items (shopping_list_id);

ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shopping_list_items_all ON shopping_list_items;
CREATE POLICY shopping_list_items_all ON shopping_list_items
  FOR ALL USING (true) WITH CHECK (true);

-- If your shopping_lists table still uses "purchased" instead of "is_purchased":
-- ALTER TABLE shopping_lists RENAME COLUMN purchased TO is_purchased;
