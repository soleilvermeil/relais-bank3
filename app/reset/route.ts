import { NextResponse } from "next/server";
import { clearAllBankCookies, getCurrentUserId } from "@/lib/bank-cookies";
import { deleteUser } from "@/lib/db/users";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (userId != null) {
    await deleteUser(userId);
  }
  await clearAllBankCookies();
  return NextResponse.redirect(new URL("/", request.url));
}
