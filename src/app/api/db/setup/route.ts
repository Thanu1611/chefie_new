import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { generateSetupSql } from "@/lib/db/setup-sql";
import { seedViaSupabase } from "@/lib/db/seed-supabase";

export async function POST() {
  try {
    const sqlPath = path.join(process.cwd(), "supabase", "setup.sql");
    fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
    fs.writeFileSync(sqlPath, generateSetupSql(), "utf8");

    const seeded = await seedViaSupabase();

    if (seeded) {
      return NextResponse.json({
        ok: true,
        message: "Database seeded successfully via Supabase.",
      });
    }

    return NextResponse.json({
      ok: false,
      message:
        "Could not seed via API. Open Supabase SQL Editor and run supabase/setup.sql (file was written to your project).",
      sqlPath: "supabase/setup.sql",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Setup failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
