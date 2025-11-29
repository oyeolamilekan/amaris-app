import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import "dotenv/config";
import path from "path";

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  try {
    // Resolve migrations folder relative to this file
    // This file is in src/, migrations are in src/migrations
    const migrationsFolder = path.join(import.meta.dirname, "migrations");

    await migrate(db, { migrationsFolder });

    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
  } catch (err) {
    console.error("❌ Migration failed");
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrate();
