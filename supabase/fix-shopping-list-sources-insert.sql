-- Quick fix if Add to View List fails with RLS on shopping_list_sources.
-- Paste into Supabase SQL Editor and Run.

DROP POLICY IF EXISTS shopping_list_sources_insert ON shopping_list_sources;
CREATE POLICY shopping_list_sources_insert ON shopping_list_sources
  FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS shopping_list_sources_select ON shopping_list_sources;
CREATE POLICY shopping_list_sources_select ON shopping_list_sources
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS shopping_list_sources_update ON shopping_list_sources;
CREATE POLICY shopping_list_sources_update ON shopping_list_sources
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS shopping_list_sources_delete ON shopping_list_sources;
CREATE POLICY shopping_list_sources_delete ON shopping_list_sources
  FOR DELETE TO public
  USING (true);

GRANT ALL ON shopping_list_sources TO anon, authenticated, service_role;
