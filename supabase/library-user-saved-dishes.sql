-- Run in Supabase SQL Editor: per-user library (saved dishes).

ALTER TABLE saved_dishes
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE saved_dishes
  ADD COLUMN IF NOT EXISTS dish_name text;

-- Remove anonymous/local rows without a user
DELETE FROM saved_dishes WHERE user_id IS NULL;

ALTER TABLE saved_dishes
  ALTER COLUMN user_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS saved_dishes_user_dish_idx
  ON saved_dishes (user_id, dish_id);

ALTER TABLE saved_dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saved_dishes_select ON saved_dishes;
DROP POLICY IF EXISTS saved_dishes_insert ON saved_dishes;
DROP POLICY IF EXISTS saved_dishes_delete ON saved_dishes;

CREATE POLICY saved_dishes_select ON saved_dishes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY saved_dishes_insert ON saved_dishes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY saved_dishes_delete ON saved_dishes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
