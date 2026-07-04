/**
 * Run: npx tsx src/lib/db/migrate.ts
 * Applies all pending SQL migrations in order.
 */
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

async function migrate() {
  const url = process.env.NEON_DB_URL;
  if (!url) throw new Error("NEON_DB_URL is not set");

  const sql = neon(url);
  const dir = path.join(process.cwd(), "src/lib/db/migrations");

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)…`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`  ▶ ${file}`);
    // Neon HTTP driver requires one statement at a time
    const statements = content
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));
    for (const stmt of statements) {
      await sql.query(stmt + ";");
    }
    console.log(`  ✓ ${file}`);
  }

  console.log("Migrations complete.");
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
