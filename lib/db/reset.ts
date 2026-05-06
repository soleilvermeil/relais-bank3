import { closeDb, getDb } from "./client";

export function resetDb(): void {
  const db = getDb();
  db.exec(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS accounts;
  `);
  closeDb();
  getDb();
}
