import { buildDishSeeds, CUISINE_SEED } from "./seed-data";

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

export function generateSetupSql(): string {
  const lines: string[] = [
    "-- Supabase SQL Editor: paste and Run once",
    "",
    "DROP TABLE IF EXISTS shopping_list_sources CASCADE;",
    "DROP TABLE IF EXISTS shopping_list_ranges CASCADE;",
    "DROP TABLE IF EXISTS shopping_list_items CASCADE;",
    "DROP TABLE IF EXISTS shopping_lists CASCADE;",
    "DROP TABLE IF EXISTS meal_plans CASCADE;",
    "DROP TABLE IF EXISTS dish_steps CASCADE;",
    "DROP TABLE IF EXISTS dishes CASCADE;",
    "DROP TABLE IF EXISTS cuisines CASCADE;",
    "DROP TABLE IF EXISTS saved_dishes CASCADE;",
    "",
    `CREATE TABLE cuisines (
  cuisine_id text PRIMARY KEY,
  cuisine_name text NOT NULL,
  image_url text NOT NULL,
  short_description text NOT NULL
);`,
    `CREATE TABLE dishes (
  dish_id text PRIMARY KEY,
  cuisine_id text NOT NULL REFERENCES cuisines(cuisine_id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  description text NOT NULL,
  meal_type text NOT NULL,
  dish_type text NOT NULL,
  image_url text NOT NULL,
  prep_time integer NOT NULL,
  cooking_time integer NOT NULL
);`,
    `CREATE TABLE dish_steps (
  step_id serial PRIMARY KEY,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  instruction text NOT NULL,
  break_time_minutes integer NOT NULL DEFAULT 0,
  timer_required boolean NOT NULL DEFAULT false,
  timer_minutes integer
);`,
    `CREATE TABLE saved_dishes (
  id serial PRIMARY KEY,
  dish_id text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);`,
    `CREATE TABLE meal_plans (
  plan_id serial PRIMARY KEY,
  plan_date date NOT NULL,
  meal_type text NOT NULL,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);`,
    `CREATE TABLE shopping_lists (
  id serial PRIMARY KEY,
  plan_date date NOT NULL,
  ingredient_name text NOT NULL,
  quantity text NOT NULL DEFAULT '',
  is_purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);`,
    `CREATE TABLE shopping_list_items (
  id serial PRIMARY KEY,
  shopping_list_id int4 NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity text NOT NULL DEFAULT '',
  is_purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);`,
    `CREATE TABLE shopping_list_sources (
  id serial PRIMARY KEY,
  shopping_list_item_id integer NOT NULL REFERENCES shopping_list_items(id) ON DELETE CASCADE,
  plan_id integer NOT NULL REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shopping_list_item_id, plan_id)
);`,
    "",
    "DROP POLICY IF EXISTS cuisines_read ON cuisines;",
    "DROP POLICY IF EXISTS dishes_read ON dishes;",
    "DROP POLICY IF EXISTS dish_steps_read ON dish_steps;",
    "DROP POLICY IF EXISTS cuisines_insert ON cuisines;",
    "DROP POLICY IF EXISTS dishes_insert ON dishes;",
    "DROP POLICY IF EXISTS dish_steps_insert ON dish_steps;",
    "DROP POLICY IF EXISTS cuisines_delete ON cuisines;",
    "DROP POLICY IF EXISTS dishes_delete ON dishes;",
    "DROP POLICY IF EXISTS dish_steps_delete ON dish_steps;",
    "DROP POLICY IF EXISTS meal_plans_all ON meal_plans;",
    "DROP POLICY IF EXISTS shopping_lists_all ON shopping_lists;",
    "DROP POLICY IF EXISTS shopping_list_items_all ON shopping_list_items;",
    "DROP POLICY IF EXISTS shopping_list_sources_all ON shopping_list_sources;",
    "DROP POLICY IF EXISTS shopping_list_sources_select ON shopping_list_sources;",
    "DROP POLICY IF EXISTS shopping_list_sources_insert ON shopping_list_sources;",
    "DROP POLICY IF EXISTS shopping_list_sources_update ON shopping_list_sources;",
    "DROP POLICY IF EXISTS shopping_list_sources_delete ON shopping_list_sources;",
    "",
    "ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE dish_steps ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE shopping_list_sources ENABLE ROW LEVEL SECURITY;",
    "CREATE POLICY cuisines_read ON cuisines FOR SELECT USING (true);",
    "CREATE POLICY dishes_read ON dishes FOR SELECT USING (true);",
    "CREATE POLICY dish_steps_read ON dish_steps FOR SELECT USING (true);",
    "CREATE POLICY cuisines_insert ON cuisines FOR INSERT WITH CHECK (true);",
    "CREATE POLICY dishes_insert ON dishes FOR INSERT WITH CHECK (true);",
    "CREATE POLICY dish_steps_insert ON dish_steps FOR INSERT WITH CHECK (true);",
    "CREATE POLICY cuisines_delete ON cuisines FOR DELETE USING (true);",
    "CREATE POLICY dishes_delete ON dishes FOR DELETE USING (true);",
    "CREATE POLICY dish_steps_delete ON dish_steps FOR DELETE USING (true);",
    "CREATE POLICY meal_plans_all ON meal_plans FOR ALL USING (true) WITH CHECK (true);",
    "CREATE POLICY shopping_lists_all ON shopping_lists FOR ALL USING (true) WITH CHECK (true);",
    "CREATE POLICY shopping_list_items_all ON shopping_list_items FOR ALL USING (true) WITH CHECK (true);",
    "CREATE POLICY shopping_list_sources_select ON shopping_list_sources FOR SELECT TO anon, authenticated, service_role USING (true);",
    "CREATE POLICY shopping_list_sources_insert ON shopping_list_sources FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);",
    "CREATE POLICY shopping_list_sources_update ON shopping_list_sources FOR UPDATE TO anon, authenticated, service_role USING (true) WITH CHECK (true);",
    "CREATE POLICY shopping_list_sources_delete ON shopping_list_sources FOR DELETE TO anon, authenticated, service_role USING (true);",
    "GRANT ALL ON shopping_list_sources TO anon, authenticated, service_role;",
    "",
  ];

  for (const c of CUISINE_SEED) {
    lines.push(
      `INSERT INTO cuisines VALUES ('${sqlEscape(c.cuisineId)}','${sqlEscape(c.cuisineName)}','${sqlEscape(c.imageUrl)}','${sqlEscape(c.shortDescription)}');`,
    );
  }

  for (const d of buildDishSeeds()) {
    lines.push(
      `INSERT INTO dishes VALUES ('${sqlEscape(d.dishId)}','${sqlEscape(d.cuisineId)}','${sqlEscape(d.dishName)}','${sqlEscape(d.description)}','${sqlEscape(d.mealType)}','${sqlEscape(d.dishType)}','${sqlEscape(d.imageUrl)}',${d.prepTime},${d.cookingTime});`,
    );
    d.steps.forEach((step, i) => {
      const tr = step.timerRequired ? "true" : "false";
      const tm = step.timerMinutes ?? "NULL";
      lines.push(
        `INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('${sqlEscape(d.dishId)}',${i + 1},'${sqlEscape(step.title)}','${sqlEscape(step.instruction)}',${step.breakTimeMinutes ?? 0},${tr},${tm});`,
      );
    });
  }

  lines.push(
    "",
    "-- Verify (optional)",
    "SELECT 'cuisines' AS table_name, COUNT(*)::int AS rows FROM cuisines",
    "UNION ALL SELECT 'dishes', COUNT(*)::int FROM dishes",
    "UNION ALL SELECT 'dish_steps', COUNT(*)::int FROM dish_steps;",
  );

  return lines.join("\n");
}
