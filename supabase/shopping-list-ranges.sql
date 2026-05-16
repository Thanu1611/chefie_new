-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS shopping_list_ranges (
  id serial PRIMARY KEY,
  from_date date NOT NULL,
  to_date date NOT NULL,
  plan_snapshot_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shopping_list_ranges_lookup_idx
  ON shopping_list_ranges (from_date, to_date, plan_snapshot_hash);

ALTER TABLE shopping_list_ranges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shopping_list_ranges_all ON shopping_list_ranges;
CREATE POLICY shopping_list_ranges_all ON shopping_list_ranges
  FOR ALL USING (true) WITH CHECK (true);
