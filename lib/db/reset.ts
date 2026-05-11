import { closeDb, dbRun, ensureSchema } from "./client";

/** Full wipe for development / manual reset (drops all bank tables, then recreates schema). */
export async function resetDb(): Promise<void> {
  await dbRun(`DROP TABLE IF EXISTS bank_ebills`);
  await dbRun(`DROP TABLE IF EXISTS bank_user_ebill_emitters`);
  await dbRun(`DROP TABLE IF EXISTS bank_cards`);
  await dbRun(`DROP TABLE IF EXISTS bank_standing_orders`);
  await dbRun(`DROP TABLE IF EXISTS bank_transactions`);
  await dbRun(`DROP TABLE IF EXISTS bank_accounts`);
  await dbRun(`DROP TABLE IF EXISTS bank_ebill_emitters`);
  await dbRun(`DROP TABLE IF EXISTS bank_users`);
  await closeDb();
  await ensureSchema();
}
