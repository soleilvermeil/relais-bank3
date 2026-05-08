import { getDb } from "./client";
import { seedUserDemo } from "./seed";

export type User = {
  id: number;
  contract_number: string;
  created_at: string;
};

/** Strict `XXXX-XXXX-C`; returns normalized 9-digit string or null if invalid checksum. */
export function parseContractNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^\d{4}-\d{4}-\d$/.test(trimmed)) return null;
  const digits = trimmed.replace(/-/g, "");
  const sum = [...digits].reduce((s, c) => s + Number(c), 0);
  return sum % 10 === 0 ? digits : null;
}

export function findUserByContract(contract: string): User | null {
  const row = getDb()
    .prepare(`SELECT id, contract_number, created_at FROM users WHERE contract_number = ?`)
    .get(contract) as User | undefined;
  return row ?? null;
}

export function findOrCreateUser(contract: string): User {
  const existing = findUserByContract(contract);
  if (existing) return existing;

  const db = getDb();
  return db.transaction(() => {
    const result = db.prepare(`INSERT INTO users (contract_number) VALUES (?)`).run(contract);
    const userId = Number(result.lastInsertRowid);
    seedUserDemo(db, userId);
    const row = db
      .prepare(`SELECT id, contract_number, created_at FROM users WHERE id = ?`)
      .get(userId) as User | undefined;
    if (!row) throw new Error("Failed to load user after insert");
    return row;
  })();
}

export function deleteUser(userId: number): void {
  getDb().prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}
