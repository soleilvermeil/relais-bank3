"use server";

import { redirect } from "next/navigation";
import { clearUserConnectedCookie, writeUserConnectedCookie } from "@/lib/bank-cookies";

export async function fakeLoginAction(): Promise<void> {
  await writeUserConnectedCookie(true);
  redirect("/");
}

export async function fakeLogoutAction(): Promise<void> {
  await clearUserConnectedCookie();
  redirect("/");
}
