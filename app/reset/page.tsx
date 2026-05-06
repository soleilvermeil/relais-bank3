import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetDb } from "@/lib/db/reset";

export const dynamic = "force-dynamic";

export default async function ResetPage() {
  resetDb();
  revalidatePath("/", "layout");
  redirect("/");
}
