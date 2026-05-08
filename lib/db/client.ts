import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH = join(process.cwd(), "data", "bank.sqlite");
const SCHEMA_PATH = join(process.cwd(), "lib", "db", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __relaisBankDb: Database.Database | undefined;
}

/** Existing DBs without `users` table need tables dropped so schema.sql can recreate with user_id FKs. */
function wipeIfLegacy(db: Database.Database): void {
  const hasUsers = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();
  const hasAccounts = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'")
    .get();
  if (!hasUsers && hasAccounts) {
    db.exec(`
      DROP TABLE IF EXISTS standing_orders;
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS accounts;
    `);
  }
}

function applySchema(db: Database.Database): void {
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
}

/** Existing DBs created before `is_cancelled` need a column migration (CREATE TABLE IF NOT EXISTS does not add columns). */
function migrateStandingOrdersCancelColumn(db: Database.Database): void {
  const columns = db
    .prepare("PRAGMA table_info(standing_orders)")
    .all() as { name: string }[];
  if (!columns.some((col) => col.name === "is_cancelled")) {
    db.exec(
      "ALTER TABLE standing_orders ADD COLUMN is_cancelled INTEGER NOT NULL DEFAULT 0",
    );
  }
}

function openDatabase(): Database.Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  wipeIfLegacy(db);
  applySchema(db);
  migrateStandingOrdersCancelColumn(db);
  return db;
}

export function getDb(): Database.Database {
  if (!globalThis.__relaisBankDb) {
    globalThis.__relaisBankDb = openDatabase();
  }
  return globalThis.__relaisBankDb;
}

export function closeDb(): void {
  if (globalThis.__relaisBankDb) {
    globalThis.__relaisBankDb.close();
    globalThis.__relaisBankDb = undefined;
  }
}
