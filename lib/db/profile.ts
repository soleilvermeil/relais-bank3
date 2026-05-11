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
    `SELECT 1 AS one FROM user_profiles WHERE LOWER(TRIM(email)) = LOWER(TRIM(@email)) LIMIT 1`,
    { email },
  );
  return row != null;
}

export async function getProfileByUserId(userId: number): Promise<UserProfile | null> {
  return dbGet<UserProfile>(
    `SELECT user_id, first_name, last_name, email, updated_at
     FROM user_profiles WHERE user_id = @userId`,
    { userId },
  );
}

export async function upsertProfile(
  userId: number,
  fields: { firstName: string; lastName: string; email: string },
): Promise<void> {
  await dbRun(
    `INSERT INTO user_profiles (user_id, first_name, last_name, email)
     VALUES (@userId, @firstName, @lastName, @email)
     ON CONFLICT (user_id) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       email = EXCLUDED.email,
       updated_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')`,
    {
      userId,
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
    },
  );
}
