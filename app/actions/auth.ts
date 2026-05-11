"use server";

import { redirect } from "next/navigation";
import {
  clearPendingSignupCookie,
  clearUserContractCookie,
  writePendingSignupContract,
  writeUserContractCookie,
} from "@/lib/bank-cookies";
import { findUserByContract, parseContractNumber } from "@/lib/db/users";

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
  const existing = await findUserByContract(contract);
  if (existing) {
    await clearPendingSignupCookie();
    await writeUserContractCookie(contract);
    redirect("/");
  }
  await clearUserContractCookie();
  await writePendingSignupContract(contract);
  redirect("/onboarding");
}

export async function logoutAction(): Promise<void> {
  await clearUserContractCookie();
  await clearPendingSignupCookie();
  redirect("/");
}
