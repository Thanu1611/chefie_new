import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { getDatabaseUrl, getDatabaseUrlHelp } from "./connection";

async function runMigrations() {
  const url = getDatabaseUrl();
  if (!url) {
    console.error(getDatabaseUrlHelp());
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), "drizzle", "0001_cuisines_dishes.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = postgres(url, { prepare: false, max: 1 });
  console.log("Applying schema migration...");
  await client.unsafe(sql);
  console.log("Migration complete.");
  await client.end();
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
