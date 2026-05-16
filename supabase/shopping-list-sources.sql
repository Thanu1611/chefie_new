-- Run in Supabase SQL Editor (safe to re-run)

CREATE TABLE IF NOT EXISTS shopping_list_sources (
  id serial PRIMARY KEY,
  shopping_list_item_id integer NOT NULL REFERENCES shopping_list_items(id) ON DELETE CASCADE,
  plan_id integer NOT NULL REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shopping_list_item_id, plan_id)
);

CREATE INDEX IF NOT EXISTS shopping_list_sources_plan_idx ON shopping_list_sources (plan_id);
CREATE INDEX IF NOT EXISTS shopping_list_sources_item_idx ON shopping_list_sources (shopping_list_item_id);

ALTER TABLE shopping_list_sources ENABLE ROW LEVEL SECURITY;

-- Drop legacy / partial policies
DROP POLICY IF EXISTS shopping_list_sources_all ON shopping_list_sources;
DROP POLICY IF EXISTS shopping_list_sources_select ON shopping_list_sources;
DROP POLICY IF EXISTS shopping_list_sources_insert ON shopping_list_sources;
DROP POLICY IF EXISTS shopping_list_sources_update ON shopping_list_sources;
DROP POLICY IF EXISTS shopping_list_sources_delete ON shopping_list_sources;

-- Explicit policies (public = all roles, including publishable/anon keys)
CREATE POLICY shopping_list_sources_select ON shopping_list_sources
  FOR SELECT TO public
  USING (true);

CREATE POLICY shopping_list_sources_insert ON shopping_list_sources
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY shopping_list_sources_update ON shopping_list_sources
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY shopping_list_sources_delete ON shopping_list_sources
  FOR DELETE TO public
  USING (true);

GRANT ALL ON shopping_list_sources TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE shopping_list_sources_id_seq TO anon, authenticated, service_role;
