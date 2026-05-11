import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserId, readPendingSignupContract } from "@/lib/bank-cookies";
import { getProfileByUserId, type UserProfile } from "@/lib/db/profile";
import { PATHNAME_HEADER } from "@/lib/internal-headers";

function refererPathname(h: Headers): string {
  const referer = h.get("referer");
  if (!referer) return "";
  try {
    return new URL(referer).pathname;
  } catch {
    return "";
  }
}

export type CurrentUserProfileState =
  | { userId: null; profile: null }
  | { userId: number; profile: UserProfile | null };

/** One DB round-trip for profile when logged in; deduped per request via React cache. */
export const getCurrentUserProfileState = cache(async (): Promise<CurrentUserProfileState> => {
  const userId = await getCurrentUserId();
  if (userId == null) return { userId: null, profile: null };
  const profile = await getProfileByUserId(userId);
  return { userId, profile };
});

export async function applyProfileGate(): Promise<void> {
  const h = await headers();
  const pathnameMw = h.get(PATHNAME_HEADER) ?? "";
  const refPath = refererPathname(h);
  const isOnboardingRoute =
    pathnameMw === "/onboarding" ||
    (pathnameMw === "" && refPath === "/onboarding");

  const pending = await readPendingSignupContract();
  const { userId, profile } = await getCurrentUserProfileState();

  if (isOnboardingRoute) {
    const allowedOnboarding = pending != null || userId != null;
    if (!allowedOnboarding) {
      redirect("/");
    }
    if (userId != null && profile != null) {
      redirect("/");
    }
    return;
  }

  if (pending != null) {
    redirect("/onboarding");
  }

  if (userId != null && profile == null) {
    if (h.get("purpose") === "prefetch") {
      return;
    }
    const secFetchMode = h.get("sec-fetch-mode");
    if (secFetchMode != null && secFetchMode !== "" && secFetchMode !== "navigate") {
      return;
    }
    redirect("/onboarding");
  }
}
