import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { seedDb } from "./seed";

const DB_PATH = join(process.cwd(), "data", "bank.sqlite");
const SCHEMA_PATH = join(process.cwd(), "lib", "db", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __relaisBankDb: Database.Database | undefined;
}

function applySchema(db: Database.Database): void {
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
}

function isEmpty(db: Database.Database): boolean {
  const row = db.prepare("SELECT COUNT(*) AS count FROM accounts").get() as {
    count: number;
  };
  return row.count === 0;
}

function openDatabase(): Database.Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  applySchema(db);
  if (isEmpty(db)) {
    seedDb(db);
  }
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
