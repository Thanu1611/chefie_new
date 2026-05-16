/**
 * Resolves Postgres URL for Drizzle.
 *
 * Use either:
 * - DATABASE_URL (full URI from Supabase → Database → Connection string), or
 * - SUPABASE_DB_PASSWORD (+ optional SUPABASE_DB_HOST from the same screen)
 */
export function getDatabaseUrl(): string | undefined {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) return undefined;

  const host =
    process.env.SUPABASE_DB_HOST?.trim() ??
    buildDefaultPoolerHost(supabaseUrl);

  if (!host) return undefined;

  const user = process.env.SUPABASE_DB_USER?.trim() ?? "postgres";
  const port = process.env.SUPABASE_DB_PORT?.trim() ?? "6543";
  const database = process.env.SUPABASE_DB_NAME?.trim() ?? "postgres";

  const projectRef = extractProjectRef(supabaseUrl);
  const poolerUser = projectRef ? `postgres.${projectRef}` : user;

  return `postgresql://${poolerUser}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function extractProjectRef(supabaseUrl: string): string | null {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

function buildDefaultPoolerHost(supabaseUrl: string): string | null {
  const ref = extractProjectRef(supabaseUrl);
  if (!ref) return null;
  const region = process.env.SUPABASE_DB_REGION?.trim() ?? "ap-southeast-1";
  return `aws-0-${region}.pooler.supabase.com`;
}

export function getDatabaseUrlHelp(): string {
  return [
    "Drizzle needs a Postgres connection. Add ONE of these to .env:",
    "",
    "Option A (recommended) — paste the full URI from Supabase:",
    "  Dashboard → Project Settings → Database → Connection string → URI (Transaction pooler)",
    "  DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-....pooler.supabase.com:6543/postgres",
    "",
    "Option B — password + host from that same screen:",
    "  SUPABASE_DB_PASSWORD=your_database_password",
    "  SUPABASE_DB_HOST=aws-0-xxxxx.pooler.supabase.com",
    "",
    "NEXT_PUBLIC_SUPABASE_URL is for the browser client only — it is not DATABASE_URL.",
  ].join("\n");
}
