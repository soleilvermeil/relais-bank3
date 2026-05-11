import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  blockEbillEmitterAction,
  acceptEbillEmitterAction,
  unblockEbillEmitterAction,
} from "@/app/actions/ebills";
import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { SectionTitle } from "@/components/atoms/section-title";
import { EbillApproveForm } from "@/components/organisms/ebill-approve-form";
import { SummarySection, type SummaryRow } from "@/components/organisms/bank-review-summary";
import { formatChfCurrency } from "@/lib/bank-money";
import { getEbillDetailForUser, type EbillDetail } from "@/lib/db/ebills";
import { listSelectableAccounts, localizeAccounts } from "@/lib/db/accounts";
import { getServerT } from "@/lib/i18n/server";
import { getCurrentUserProfileState } from "@/lib/profile-gate";
import type { TFunction } from "i18next";

export const dynamic = "force-dynamic";

const COUNTRY_LABELS: Record<string, string> = {
  ch: "Switzerland / Suisse",
  fr: "France",
  de: "Germany / Allemagne",
  it: "Italy / Italie",
};

function dash(value: string | null | undefined): string {
  const s = (value ?? "").trim();
  return s === "" ? "—" : s;
}

function countryLabel(value: string): string {
  return COUNTRY_LABELS[value.toLowerCase()] ?? dash(value);
}

function ebillBeneficiaryRows(t: TFunction, detail: EbillDetail): SummaryRow[] {
  const e = detail.emitter;
  return [
    { label: t("bankPayment.fields.beneficiaryIban"), value: dash(e.creditor_iban) },
    { label: t("bankPayment.fields.beneficiaryBic"), value: dash(e.creditor_bic) },
    { label: t("bankPayment.fields.beneficiaryName"), value: dash(e.creditor_name) },
    { label: t("bankPayment.fields.country"), value: countryLabel(e.creditor_country) },
    { label: t("bankPayment.fields.postalCode"), value: dash(e.creditor_postal_code) },
    { label: t("bankPayment.fields.locality"), value: dash(e.creditor_city) },
    { label: t("bankPayment.fields.street"), value: dash(e.creditor_address1) },
    { label: t("bankPayment.fields.houseNumber"), value: dash(e.creditor_address2) },
  ];
}

function ebillDetailsRows(t: TFunction, detail: EbillDetail): SummaryRow[] {
  const e = detail.emitter;
  return [
    { label: t("bankEbills.fields.reference"), value: dash(detail.reference_text) },
    { label: t("bankPayment.fields.rfReference"), value: dash(e.rf_reference) },
    {
      label: t("bankPayment.fields.communicationToBeneficiary"),
      value: dash(e.communication_to_beneficiary),
    },
    { label: t("bankPayment.fields.accountingTextForYou"), value: dash(detail.accounting_text) },
  ];
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EbillDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const ebillId = Number(idRaw);
  if (!Number.isFinite(ebillId) || ebillId <= 0) {
    notFound();
  }

  const { userId, profile } = await getCurrentUserProfileState();
  if (userId == null) {
    redirect("/");
  }
  if (profile == null) {
    redirect("/onboarding");
  }

  const detail = await getEbillDetailForUser(userId, ebillId);
  if (!detail) {
    notFound();
  }

  const t = await getServerT();
  const selectable = localizeAccounts(await listSelectableAccounts(userId), t);
  const debitDropdownOptions = selectable.map((account) => ({
    id: account.id,
    name: account.name,
    identifier: account.identifier,
    balance: account.balance,
  }));
  const beneficiaryRows = ebillBeneficiaryRows(t, detail);
  const detailsRows = ebillDetailsRows(t, detail);
  const returnTo = `/payments/ebills/${ebillId}`;

  const pendingAcceptance = detail.accepted_at == null && detail.blocked_at == null;
  const isBlocked = detail.blocked_at != null;
  const canApprove =
    detail.status === "open" && detail.accepted_at != null && detail.blocked_at == null;

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
          <Link href="/payments/ebills" className="font-medium text-primary hover:underline">
            {t("bankNavigation.ebills")}
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{t("bankEbills.detailTitle")}</span>
        </nav>

        <header className="space-y-3">
          <SectionTitle as="h1">{detail.emitter.name}</SectionTitle>
          <p className="max-w-3xl text-base text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {formatChfCurrency(detail.amount_cents / 100)}
            </span>
            <span aria-hidden="true"> · </span>
            {detail.status === "paid" ? t("bankEbills.status.paid") : t("bankEbills.status.open")}
            {detail.due_date ? (
              <>
                <span aria-hidden="true"> · </span>
                {t("bankEbills.fields.dueDate")}: {detail.due_date}
              </>
            ) : null}
          </p>
        </header>

        <div className="space-y-8">
          <SummarySection title={t("bankPayment.sections.beneficiary")} rows={beneficiaryRows} />
          <SummarySection title={t("bankPayment.sections.details")} rows={detailsRows} />
        </div>

        {detail.status === "paid" && detail.paid_transaction_id != null ? (
          <p className="text-sm text-muted-foreground">
            {t("bankEbills.paidNotice")}{" "}
            <Link
              href={`/transaction/${detail.paid_transaction_id}`}
              className="font-medium text-primary hover:underline"
            >
              {t("bankEbills.actions.viewTransaction")}
            </Link>
          </p>
        ) : null}

        {isBlocked ? (
          <section className="space-y-4">
            <header className="space-y-2">
              <SectionTitle as="h2">{t("bankEbills.sections.blockedInstitutions")}</SectionTitle>
              <p className="max-w-2xl text-sm text-muted-foreground">{t("bankEbills.hints.blockedEmitter")}</p>
            </header>
            <div className="max-w-md rounded-2xl border border-card-border bg-card p-4 sm:p-6">
              <form action={unblockEbillEmitterAction}>
                <input type="hidden" name="emitterId" value={String(detail.emitter_id)} />
                <Button type="submit" variant="secondary" wide>
                  {t("bankEbills.actions.unblockInstitution")}
                </Button>
              </form>
            </div>
          </section>
        ) : null}

        {!isBlocked && pendingAcceptance ? (
          <section className="space-y-4">
            <header className="space-y-2">
              <SectionTitle as="h2">{t("bankEbills.sections.pendingEmitters")}</SectionTitle>
              <p className="max-w-2xl text-sm text-muted-foreground">{t("bankEbills.hints.pendingEmitter")}</p>
            </header>
            <div className="flex flex-wrap gap-3 print:hidden">
              <form action={acceptEbillEmitterAction}>
                <input type="hidden" name="emitterId" value={String(detail.emitter_id)} />
                <Button type="submit" wide>
                  {t("bankEbills.actions.acceptEmitter")}
                </Button>
              </form>
              <form action={blockEbillEmitterAction}>
                <input type="hidden" name="emitterId" value={String(detail.emitter_id)} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <Button type="submit" variant="secondary" wide>
                  {t("bankEbills.actions.blockInstitution")}
                </Button>
              </form>
            </div>
          </section>
        ) : null}

        {!isBlocked && detail.accepted_at != null && detail.status === "open" ? (
          <div className="flex flex-wrap gap-3 print:hidden">
            <form action={blockEbillEmitterAction}>
              <input type="hidden" name="emitterId" value={String(detail.emitter_id)} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Button type="submit" variant="secondary" wide>
                {t("bankEbills.actions.blockInstitution")}
              </Button>
            </form>
          </div>
        ) : null}

        {canApprove && debitDropdownOptions.length > 0 ? (
          <section className="space-y-4">
            <header className="space-y-2">
              <SectionTitle as="h2">{t("bankEbills.approveSectionTitle")}</SectionTitle>
            </header>
            <div className="max-w-2xl rounded-2xl border border-card-border bg-card p-4 sm:p-6">
              <EbillApproveForm ebillId={detail.id} debitAccounts={debitDropdownOptions} />
            </div>
          </section>
        ) : null}

        <p className="print:hidden">
          <Link href="/payments/ebills" className="text-sm font-medium text-primary hover:underline">
            {t("bankEbills.actions.backToList")}
          </Link>
        </p>
      </main>
    </Container>
  );
}
