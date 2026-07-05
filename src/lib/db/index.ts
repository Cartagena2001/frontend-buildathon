import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.NEON_DB_URL) {
  throw new Error("Missing environment variable: NEON_DB_URL");
}

// Reuse HTTP connections across queries (recommended for serverless driver).
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.NEON_DB_URL, {
  fetchOptions: { cache: "no-store" },
});

export const db = drizzle(sql, { schema });
export type DB = typeof db;
