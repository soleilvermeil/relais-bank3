import { dbGet, dbRun } from "./client";

export type UserProfile = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  updated_at: string;
};

export async function isProfileEmailTakenGlobally(email: string): Promise<boolean> {
  const row = await dbGet<{ one: number }>(
    `SELECT 1 AS one FROM bank_users
     WHERE email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM(@email)) LIMIT 1`,
    { email },
  );
  return row != null;
}

export async function getProfileByUserId(userId: number): Promise<UserProfile | null> {
  return dbGet<UserProfile>(
    `SELECT id AS user_id, first_name, last_name, email, profile_updated_at AS updated_at
     FROM bank_users WHERE id = @userId AND email IS NOT NULL`,
    { userId },
  );
}

export async function upsertProfile(
  userId: number,
  fields: { firstName: string; lastName: string; email: string },
): Promise<void> {
  await dbRun(
    `UPDATE bank_users SET
       first_name = @firstName,
       last_name = @lastName,
       email = @email,
       profile_updated_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
     WHERE id = @userId`,
    {
      userId,
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
    },
  );
}
