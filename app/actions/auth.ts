"use server";

import { redirect } from "next/navigation";
import {
  clearUserContractCookie,
  writeUserContractCookie,
} from "@/lib/bank-cookies";
import { findOrCreateUser, parseContractNumber } from "@/lib/db/users";

export type LoginState = { error: "invalidCredentials" | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const contractRaw = String(formData.get("contractNumber") ?? "");
  const contract = parseContractNumber(contractRaw);
  const pwd = String(formData.get("password") ?? "");
  if (!contract || pwd !== "12345678") {
    return { error: "invalidCredentials" };
  }
  await findOrCreateUser(contract);
  await writeUserContractCookie(contract);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearUserContractCookie();
  redirect("/");
}
