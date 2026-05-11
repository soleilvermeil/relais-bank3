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
    `SELECT id, contract_number, created_at FROM bank_users WHERE contract_number = @contract`,
    { contract },
  );
  return row ?? null;
}

export type NewUserProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
};

/** Single transaction: user row (with profile fields), demo seed (first-time signup after onboarding form). */
export async function createUserSeedAndProfile(
  contract: string,
  profile: NewUserProfileFields,
): Promise<User> {
  return dbTx(async (tx) => {
    const userId = await tx.insert(
      `INSERT INTO bank_users (contract_number, first_name, last_name, email, profile_updated_at)
       VALUES (
         @contract,
         @firstName,
         @lastName,
         @email,
         to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
       ) RETURNING id`,
      {
        contract,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      },
    );
    await seedUserDemo(tx, userId);
    const row = await tx.get<User>(
      `SELECT id, contract_number, created_at FROM bank_users WHERE id = @userId`,
      { userId },
    );
    if (!row) throw new Error("Failed to load user after insert");
    return row;
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await dbRun(`DELETE FROM bank_users WHERE id = @userId`, { userId });
}
