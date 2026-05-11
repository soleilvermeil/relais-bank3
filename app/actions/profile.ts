"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearPendingSignupCookie,
  getCurrentUserId,
  readPendingSignupContract,
  writeUserContractCookie,
} from "@/lib/bank-cookies";
import { dbGet } from "@/lib/db/client";
import { isProfileEmailTakenGlobally, upsertProfile } from "@/lib/db/profile";
import { createUserSeedAndProfile, findUserByContract } from "@/lib/db/users";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export type ProfileFormState = {
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    form?: string;
  };
};

const initialErrors: ProfileFormState["errors"] = {};

function readTrimmed(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return raw === null ? "" : String(raw).trim();
}

async function isEmailTakenByOther(userId: number, email: string): Promise<boolean> {
  const row = await dbGet<{ user_id: number }>(
    `SELECT id AS user_id FROM bank_users
     WHERE email IS NOT NULL
       AND LOWER(TRIM(email)) = LOWER(TRIM(@email))
       AND id <> @userId`,
    { email, userId },
  );
  return row != null;
}

function validateProfileFields(
  firstName: string,
  lastName: string,
  email: string,
): ProfileFormState["errors"] {
  const errors: ProfileFormState["errors"] = { ...initialErrors };
  if (firstName === "") {
    errors.firstName = "required";
  }
  if (lastName === "") {
    errors.lastName = "required";
  }
  if (email === "") {
    errors.email = "required";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "invalidEmail";
  }
  return errors;
}

export async function saveProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const firstName = readTrimmed(formData, "firstName");
  const lastName = readTrimmed(formData, "lastName");
  const email = readTrimmed(formData, "email");
  const redirectRaw = readTrimmed(formData, "redirectTo");
  const redirectTo = redirectRaw === "/profile" ? "/profile" : "/";

  const fieldErrors = validateProfileFields(firstName, lastName, email);
  if (fieldErrors.firstName || fieldErrors.lastName || fieldErrors.email) {
    return { errors: fieldErrors };
  }

  const pending = await readPendingSignupContract();
  if (pending != null) {
    if (await findUserByContract(pending)) {
      await clearPendingSignupCookie();
      return { errors: { form: "contractTaken" } };
    }
    if (await isProfileEmailTakenGlobally(email)) {
      return { errors: { email: "duplicateEmail" } };
    }
    try {
      await createUserSeedAndProfile(pending, { firstName, lastName, email });
    } catch {
      return { errors: { form: "signupFailed" } };
    }
    await clearPendingSignupCookie();
    await writeUserContractCookie(pending);
    revalidatePath("/");
    revalidatePath("/onboarding");
    revalidatePath("/profile");
    redirect("/");
  }

  const userId = await getCurrentUserId();
  if (userId == null) {
    redirect("/");
  }

  const restErrors: ProfileFormState["errors"] = { ...initialErrors };
  if (await isEmailTakenByOther(userId, email)) {
    restErrors.email = "duplicateEmail";
    return { errors: restErrors };
  }

  await upsertProfile(userId, { firstName, lastName, email });
  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/profile");
  redirect(redirectTo);
}
