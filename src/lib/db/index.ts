import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "./connection";
import * as schema from "./schema";

const connectionString = getDatabaseUrl();

function createDb() {
  if (!connectionString) return null;
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export const db = createDb();
export { schema, getDatabaseUrl };
