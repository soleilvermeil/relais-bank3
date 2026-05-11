import Link from "next/link";
import { redirect } from "next/navigation";
import {
  acceptEbillEmitterAction,
  blockEbillEmitterAction,
  unblockEbillEmitterAction,
} from "@/app/actions/ebills";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { formatChfCurrency } from "@/lib/bank-money";
import {
  listAcceptedEmittersForUser,
  listBlockedEmittersForUser,
  listOpenEbillsActionable,
  listPendingEmittersForUser,
} from "@/lib/db/ebills";
import { getServerT } from "@/lib/i18n/server";
import { getCurrentUserProfileState } from "@/lib/profile-gate";

export const dynamic = "force-dynamic";

export default async function EbillsListPage() {
  const { userId, profile } = await getCurrentUserProfileState();
  if (userId == null) {
    redirect("/");
  }
  if (profile == null) {
    redirect("/onboarding");
  }

  const t = await getServerT();
  const [pending, openEbills, accepted, blocked] = await Promise.all([
    listPendingEmittersForUser(userId),
    listOpenEbillsActionable(userId),
    listAcceptedEmittersForUser(userId),
    listBlockedEmittersForUser(userId),
  ]);

  return (
    <Container>
      <main id="main-content" className="space-y-8">
        <nav
          aria-label={t("bankNavigation.breadcrumb")}
          className="text-sm text-muted-foreground print:hidden"
        >
          <Link href="/payments" className="font-medium text-primary hover:underline">
            {t("bankNavigation.payments")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankEbills.listTitle")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{t("bankEbills.listTitle")}</SectionTitle>
          <p className="max-w-2xl text-base text-muted-foreground">{t("bankEbills.listSubtitle")}</p>
        </header>

        <section className="space-y-6">
          <SectionTitle as="h2">{t("bankEbills.sections.actionsNeedingAttention")}</SectionTitle>
          <div className="flex w-full flex-col gap-8">
            <div className="w-full space-y-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t("bankEbills.sections.incomingBills")}
              </h3>
              {openEbills.length === 0 ? (
                <p className="rounded-2xl border border-card-border bg-card p-4 text-sm text-muted-foreground sm:p-6">
                  {t("bankEbills.emptyOpen")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {openEbills.map((bill) => (
                    <li key={bill.id}>
                      <Link
                        href={`/payments/ebills/${bill.id}`}
                        className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{bill.emitter_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {bill.reference_text ?? bill.accounting_text ?? "—"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {bill.due_date
                              ? `${t("bankEbills.fields.dueDate")}: ${bill.due_date}`
                              : null}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                          <span className="font-medium tabular-nums text-foreground">
                            {formatChfCurrency(bill.amount_cents / 100)}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            {t("bankEbills.actions.viewBill")}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="w-full space-y-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t("bankEbills.sections.newBillers")}
              </h3>
              {pending.length === 0 ? (
                <p className="rounded-2xl border border-card-border bg-card p-4 text-sm text-muted-foreground sm:p-6">
                  {t("bankEbills.emptyPending")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {pending.map((row) => (
                    <li
                      key={row.emitter_id}
                      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{row.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("bankEbills.pendingBillCount", { count: row.open_bill_count })}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{t("bankEbills.hints.pendingEmitter")}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-3">
                        <form action={acceptEbillEmitterAction}>
                          <input type="hidden" name="emitterId" value={String(row.emitter_id)} />
                          <Button type="submit" wide>
                            {t("bankEbills.actions.acceptEmitter")}
                          </Button>
                        </form>
                        <form action={blockEbillEmitterAction}>
                          <input type="hidden" name="emitterId" value={String(row.emitter_id)} />
                          <input type="hidden" name="returnTo" value="/payments/ebills" />
                          <Button type="submit" variant="secondary" wide>
                            {t("bankEbills.actions.blockInstitution")}
                          </Button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle as="h2">{t("bankEbills.sections.myBillers")}</SectionTitle>
          <div className="flex w-full flex-col gap-8">
            <div className="w-full space-y-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t("bankEbills.sections.acceptedEmitters")}
              </h3>
              {accepted.length === 0 ? (
                <p className="rounded-2xl border border-card-border bg-card p-4 text-sm text-muted-foreground sm:p-6">
                  {t("bankEbills.emptyAccepted")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {accepted.map((row) => (
                    <li
                      key={row.emitter_id}
                      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{row.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("bankEbills.acceptedOn", { date: row.accepted_at.slice(0, 10) })}
                        </p>
                      </div>
                      <form action={blockEbillEmitterAction} className="shrink-0">
                        <input type="hidden" name="emitterId" value={String(row.emitter_id)} />
                        <input type="hidden" name="returnTo" value="/payments/ebills" />
                        <Button type="submit" variant="secondary" wide>
                          {t("bankEbills.actions.blockInstitution")}
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="w-full space-y-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t("bankEbills.sections.blockedInstitutions")}
              </h3>
              {blocked.length === 0 ? (
                <p className="rounded-2xl border border-card-border bg-card p-4 text-sm text-muted-foreground sm:p-6">
                  {t("bankEbills.emptyBlocked")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {blocked.map((row) => (
                    <li
                      key={row.emitter_id}
                      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{row.name}</p>
                        <p className="text-sm text-muted-foreground">{t("bankEbills.hints.blockedEmitter")}</p>
                      </div>
                      <form action={unblockEbillEmitterAction} className="shrink-0">
                        <input type="hidden" name="emitterId" value={String(row.emitter_id)} />
                        <Button type="submit" variant="secondary" wide>
                          {t("bankEbills.actions.unblockInstitution")}
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </Container>
  );
}
