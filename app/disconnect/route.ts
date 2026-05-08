import { NextResponse } from "next/server";
import { clearUserContractCookie } from "@/lib/bank-cookies";

export async function GET(request: Request) {
  await clearUserContractCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
