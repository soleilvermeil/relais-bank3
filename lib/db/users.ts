import { dbGet, dbRun, dbTx } from "./client";
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

export async function findUserByContract(contract: string): Promise<User | null> {
  const row = await dbGet<User>(
    `SELECT id, contract_number, created_at FROM users WHERE contract_number = @contract`,
    { contract },
  );
  return row ?? null;
}

export async function findOrCreateUser(contract: string): Promise<User> {
  const existing = await findUserByContract(contract);
  if (existing) return existing;

  return dbTx(async (tx) => {
    const userId = await tx.insert(
      `INSERT INTO users (contract_number) VALUES (@contract) RETURNING id`,
      { contract },
    );
    await seedUserDemo(tx, userId);
    const row = await tx.get<User>(
      `SELECT id, contract_number, created_at FROM users WHERE id = @userId`,
      { userId },
    );
    if (!row) throw new Error("Failed to load user after insert");
    return row;
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await dbRun(`DELETE FROM users WHERE id = @userId`, { userId });
}
