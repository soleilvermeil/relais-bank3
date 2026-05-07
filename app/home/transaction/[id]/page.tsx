import { redirect } from "next/navigation";

const SO_PREFIX = "so";

/** Legacy `/home/transaction/...` → `/transaction/...` (summary URLs no longer use `mode`). */
export default async function LegacyHomeTransactionRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromAccount?: string; mode?: string }>;
}) {
  const { id } = await params;
  const { fromAccount, mode } = await searchParams;
  const idRaw = decodeURIComponent(id);
  let targetId = id;
  if (mode === "standing-summary" && idRaw.startsWith(`${SO_PREFIX}:`)) {
    const parts = idRaw.split(":");
    if (parts.length >= 3 && parts[0] === SO_PREFIX) {
      targetId = `${SO_PREFIX}:${parts[1]}`;
    }
  }
  const qs =
    fromAccount != null && fromAccount !== ""
      ? `?fromAccount=${encodeURIComponent(fromAccount)}`
      : "";
  redirect(`/transaction/${encodeURIComponent(targetId)}${qs}`);
}
