import { NextResponse } from "next/server";
import { clearUserConnectedCookie } from "@/lib/bank-cookies";

export async function GET(request: Request) {
  await clearUserConnectedCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
