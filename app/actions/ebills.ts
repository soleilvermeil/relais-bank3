"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  acceptEmitterForUser,
  approveEbillForUser,
  blockEmitterForUser,
  unblockEmitterForUser,
} from "@/lib/db/ebills";
import { getCurrentUserProfileState } from "@/lib/profile-gate";

async function requireUserIdWithProfile(): Promise<number> {
  const { userId, profile } = await getCurrentUserProfileState();
  if (userId == null) {
    redirect("/");
  }
  if (profile == null) {
    redirect("/onboarding");
  }
  return userId;
}

function revalidateEbillPaths(): void {
  revalidatePath("/payments");
  revalidatePath("/payments/ebills");
  revalidatePath("/account", "layout");
}

function readPositiveInt(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  const n = Number(raw === null ? NaN : String(raw).trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export async function acceptEbillEmitterAction(formData: FormData): Promise<void> {
  const userId = await requireUserIdWithProfile();
  const emitterId = readPositiveInt(formData, "emitterId");
  if (emitterId == null) {
    redirect("/payments/ebills");
  }
  const ok = await acceptEmitterForUser(userId, emitterId);
  if (!ok) {
    redirect("/payments/ebills");
  }
  revalidateEbillPaths();
  redirect("/payments/ebills");
}

export async function blockEbillEmitterAction(formData: FormData): Promise<void> {
  const userId = await requireUserIdWithProfile();
  const emitterId = readPositiveInt(formData, "emitterId");
  if (emitterId == null) {
    redirect("/payments/ebills");
  }
  await blockEmitterForUser(userId, emitterId);
  revalidateEbillPaths();
  const returnTo = formData.get("returnTo");
  if (typeof returnTo === "string" && returnTo.startsWith("/payments/ebills")) {
    redirect(returnTo);
  }
  redirect("/payments/ebills");
}

export async function unblockEbillEmitterAction(formData: FormData): Promise<void> {
  const userId = await requireUserIdWithProfile();
  const emitterId = readPositiveInt(formData, "emitterId");
  if (emitterId == null) {
    redirect("/payments/ebills");
  }
  await unblockEmitterForUser(userId, emitterId);
  revalidateEbillPaths();
  redirect("/payments/ebills");
}

export async function approveEbillAction(formData: FormData): Promise<void> {
  const userId = await requireUserIdWithProfile();
  const ebillId = readPositiveInt(formData, "ebillId");
  const debitAccountId = readPositiveInt(formData, "debitAccountId");
  if (ebillId == null || debitAccountId == null) {
    redirect("/payments/ebills");
  }
  try {
    const { transactionId } = await approveEbillForUser(userId, ebillId, debitAccountId);
    revalidateEbillPaths();
    redirect(`/transaction/${transactionId}`);
  } catch {
    redirect(`/payments/ebills/${ebillId}`);
  }
}
