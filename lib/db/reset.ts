import { closeDb, getDb } from "./client";

/** Full wipe for development / manual reset (drops user-scoped data). */
export function resetDb(): void {
  const db = getDb();
  db.exec(`
    DROP TABLE IF EXISTS standing_orders;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS users;
  `);
  closeDb();
  getDb();
}
