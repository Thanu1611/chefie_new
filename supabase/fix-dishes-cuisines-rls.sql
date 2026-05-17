-- Run in Supabase SQL Editor if meal planning shows no dishes after login.
-- Ensures all users (guest + logged in) can read predefined dishes and cuisines.

ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cuisines_read ON cuisines;
DROP POLICY IF EXISTS dishes_read ON dishes;

CREATE POLICY cuisines_read ON cuisines
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

CREATE POLICY dishes_read ON dishes
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);
