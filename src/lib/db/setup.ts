import fs from "node:fs";
import path from "node:path";
import { generateSetupSql } from "./setup-sql";
import { seedViaSupabase } from "./seed-supabase";

async function main() {
  const sql = generateSetupSql();
  const outPath = path.join(process.cwd(), "supabase", "setup.sql");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sql, "utf8");
  console.log(`Wrote ${outPath}`);

  console.log("Seeding via Supabase (your .env keys)...");
  const ok = await seedViaSupabase();

  if (ok) {
    console.log("Done — 3 cuisines, 36 dishes, all steps loaded.");
    return;
  }

  console.log(`
Tables missing or insert blocked.

Fix (one time):
1. Open: https://supabase.com/dashboard/project/aplgmqtfyajaxvsfbgtz/sql/new
2. Open file: supabase/setup.sql in this project
3. Paste all → Run

Or with dev server running: POST http://localhost:3000/api/db/setup

Then: npm run dev
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
