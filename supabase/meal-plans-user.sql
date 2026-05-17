-- Run in Supabase SQL Editor: per-user meal planning.

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

DELETE FROM meal_plans WHERE user_id IS NULL;

ALTER TABLE meal_plans
  ALTER COLUMN user_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS meal_plans_user_date_meal_idx
  ON meal_plans (user_id, plan_date, meal_type);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meal_plans_all ON meal_plans;
DROP POLICY IF EXISTS meal_plans_select ON meal_plans;
DROP POLICY IF EXISTS meal_plans_insert ON meal_plans;
DROP POLICY IF EXISTS meal_plans_delete ON meal_plans;

CREATE POLICY meal_plans_select ON meal_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY meal_plans_insert ON meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY meal_plans_delete ON meal_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
