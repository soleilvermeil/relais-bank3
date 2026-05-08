import { closeDb, dbRun, ensureSchema } from "./client";

/** Full wipe for development / manual reset (drops user-scoped data). */
export async function resetDb(): Promise<void> {
  await dbRun(`DROP TABLE IF EXISTS standing_orders`);
  await dbRun(`DROP TABLE IF EXISTS transactions`);
  await dbRun(`DROP TABLE IF EXISTS accounts`);
  await dbRun(`DROP TABLE IF EXISTS users`);
  await closeDb();
  await ensureSchema();
}
