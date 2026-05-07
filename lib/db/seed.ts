import type Database from "better-sqlite3";

type SeedAccount = {
  category: "checking" | "savings" | "retirement" | "cards";
  name: string;
  identifier: string;
  sort_order: number;
};

/** One account per category; stored `balance_cents` is always 0 — balances come from transactions. */
const SEED_ACCOUNTS: SeedAccount[] = [
  {
    category: "checking",
    name: "Checking 01",
    identifier: "CH14 8080 8001 2345 6789 0",
    sort_order: 1,
  },
  {
    category: "savings",
    name: "Savings 01",
    identifier: "CH93 8080 8000 1111 2222 3",
    sort_order: 1,
  },
  {
    category: "retirement",
    name: "Retirement A",
    identifier: "PIL-3A-001928",
    sort_order: 1,
  },
  {
    category: "cards",
    name: "Card Main",
    identifier: "XXXX XXXX XXXX 1284",
    sort_order: 1,
  },
];

/**
 * Demo ledger is capped at **local today**: no inserted rows with execution_date after today,
 * except standing-bill placeholders (next cycle after today).
 */
export function seedDb(db: Database.Database): void {
  const insertAccount = db.prepare(
    `INSERT INTO accounts (category, name, identifier, balance_cents, currency, sort_order)
     VALUES (@category, @name, @identifier, 0, 'CHF', @sort_order)`,
  );

  const [checking1, savings1, retirementA, cardMain] = db.transaction(() => {
    const ids: number[] = [];
    for (const account of SEED_ACCOUNTS) {
      const result = insertAccount.run(account);
      ids.push(Number(result.lastInsertRowid));
    }
    return ids as [number, number, number, number];
  })();

  const AMOUNTS = {
    paycheck: 400000,
    rent: 120000,
    healthInsurance: 50000,
    internet: 10000,
    threeAContribution: 100000,
    transferToSavings: 50000,
    cardPayment: 10000,
  } as const;

  /** In-store merchants debit checking; Galaxus (online card) debits the card account. */
  const SHOPS: {
    name: "Migros, Métropole" | "Coop, Saint-François" | "Fnac, Rue de Genève" | "Payot, Place de la Louve" | "Galaxus";
    minCents: number;
    maxCents: number;
    dailyProbability: number;
    paidWithCard: boolean;
  }[] = [
    { name: "Migros, Métropole", minCents: 50_00, maxCents: 200_00, dailyProbability: 2 / 30, paidWithCard: false },
    { name: "Coop, Saint-François", minCents: 5_00, maxCents: 10_00, dailyProbability: 5 / 30, paidWithCard: false },
    { name: "Fnac, Rue de Genève", minCents: 50_00, maxCents: 200_00, dailyProbability: 0.5 / 30, paidWithCard: false },
    { name: "Payot, Place de la Louve", minCents: 5_00, maxCents: 20_00, dailyProbability: 0.5 / 30, paidWithCard: false },
    { name: "Galaxus", minCents: 20_00, maxCents: 200_00, dailyProbability: 1 / 30, paidWithCard: true },
  ];

  const RNG_SEED = 0x4d595df5;
  const RANGE_MONTH_COUNT = 12;
  const RANGE_END_YEAR = 2026;
  const RANGE_END_MONTH_INDEX = 4; // May (0-based)

  const RECURRING_BILLS = [
    {
      amountCents: AMOUNTS.rent,
      beneficiaryName: "Cogestim",
      beneficiaryIban: "CH90 8000 0000 0000 1100 3",
      rfReference: "RF18 5390 0754 7034 0000 1123",
      beneficiaryPostalCode: "1003",
      beneficiaryCity: "Lausanne",
      description: "Loyer",
    },
    {
      amountCents: AMOUNTS.healthInsurance,
      beneficiaryName: "Groupe Mutuel",
      beneficiaryIban: "CH09 0077 7700 0000 1234 2",
      rfReference: "RF28 2035 6402 1500 9800 7714",
      beneficiaryPostalCode: "1920",
      beneficiaryCity: "Martigny",
      description: "Assurance maladie",
    },
    {
      amountCents: AMOUNTS.internet,
      beneficiaryName: "Swisscom",
      beneficiaryIban: "CH56 0483 5000 0000 5500 2",
      rfReference: "RF72 9981 4400 0071 5560 2048",
      beneficiaryPostalCode: "3050",
      beneficiaryCity: "Bern",
      description: "Internet",
    },
  ] as const;

  const insertPastFlow = db.prepare(
    `INSERT INTO transactions
       (kind, debit_account_id, credit_account_id, amount_cents, currency, execution_date,
        counterparty_name, counterparty_iban, execution_mode, accounting_text)
     VALUES (@kind, @debit_account_id, @credit_account_id, @amount_cents, 'CHF', @execution_date,
        @counterparty_name, @counterparty_iban, @execution_mode, @accounting_text)`,
  );

  /** Executed bill (appears in past once posted); not a standing order. */
  const insertBillOneTime = db.prepare(
    `INSERT INTO transactions (
       kind, debit_account_id, amount_cents, currency, execution_date,
       beneficiary_name, beneficiary_iban, beneficiary_bic, beneficiary_country,
       beneficiary_postal_code, beneficiary_city,
       payment_type, first_execution_date, frequency, weekend_holiday_rule,
       period_type, end_date, is_express,
       rf_reference, accounting_text
     ) VALUES (
       'payment', @debit_account_id, @amount_cents, 'CHF', @execution_date,
       @beneficiary_name, @beneficiary_iban, NULL, 'ch',
       @beneficiary_postal_code, @beneficiary_city,
       'oneTime', NULL, NULL, NULL,
       NULL, NULL, 0,
       @rf_reference, @accounting_text
     )`,
  );

  /** Next monthly cycle only — shown as standing order in the UI. */
  const insertBillStanding = db.prepare(
    `INSERT INTO transactions (
       kind, debit_account_id, amount_cents, currency, execution_date,
       beneficiary_name, beneficiary_iban, beneficiary_bic, beneficiary_country,
       beneficiary_postal_code, beneficiary_city,
       payment_type, first_execution_date, frequency, weekend_holiday_rule,
       period_type, end_date, is_express,
       rf_reference, accounting_text
     ) VALUES (
       'payment', @debit_account_id, @amount_cents, 'CHF', @execution_date,
       @beneficiary_name, @beneficiary_iban, NULL, 'ch',
       @beneficiary_postal_code, @beneficiary_city,
       'standing', @first_execution_date, 'monthly', 'after',
       'unlimited', NULL, 0,
       @rf_reference, @accounting_text
     )`,
  );

  type FlowRow = {
    kind: "payment" | "transfer" | "purchaseService" | "credit" | "debit";
    debit_account_id: number | null;
    credit_account_id: number | null;
    amount_cents: number;
    execution_date: string;
    counterparty_name: string | null;
    counterparty_iban: string | null;
    execution_mode: string | null;
    accounting_text: string | null;
  };

  function flow(r: FlowRow): void {
    insertPastFlow.run({
      kind: r.kind,
      debit_account_id: r.debit_account_id,
      credit_account_id: r.credit_account_id,
      amount_cents: r.amount_cents,
      execution_date: r.execution_date,
      counterparty_name: r.counterparty_name,
      counterparty_iban: r.counterparty_iban,
      execution_mode: r.execution_mode,
      accounting_text: r.accounting_text,
    });
  }

  function transferOut(
    debitId: number,
    creditId: number,
    amountCents: number,
    executionDate: string,
    accountingText: string | null,
  ): void {
    flow({
      kind: "transfer",
      debit_account_id: debitId,
      credit_account_id: creditId,
      amount_cents: -Math.abs(amountCents),
      execution_date: executionDate,
      counterparty_name: null,
      counterparty_iban: null,
      execution_mode: "immediate",
      accounting_text: accountingText,
    });
  }

  function createRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  /** Integer cents: X ≈ 10^U(log10(min), log10(max)), rounded; clamped to [min, max]. Min/max must be > 0. */
  function randomLogUniformCents(rng: () => number, min: number, max: number): number {
    if (min >= max) return min;
    const logLow = Math.log10(min);
    const logHigh = Math.log10(max);
    const logX = logLow + rng() * (logHigh - logLow);
    const raw = Math.round(10 ** logX);
    return Math.min(max, Math.max(min, raw));
  }

  function isoDateUtc(year: number, monthIndex: number, day: number): string {
    const month = String(monthIndex + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${month}-${d}`;
  }

  /** Local calendar "today", same YYYY-MM-DD convention as seeded rows. */
  function todayIsoLocal(): string {
    const now = new Date();
    return isoDateUtc(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function addDaysIsoLocal(iso: string, deltaDays: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d + deltaDays);
    return isoDateUtc(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  const todayIso = todayIsoLocal();

  function daysInMonthUtc(year: number, monthIndex: number): number {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  }

  /** If date is Saturday/Sunday, move to previous Friday. */
  function adjustBeforeWeekend(year: number, monthIndex: number, day: number): string {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const weekday = date.getUTCDay();
    if (weekday === 6) date.setUTCDate(date.getUTCDate() - 1);
    if (weekday === 0) date.setUTCDate(date.getUTCDate() - 2);
    return isoDateUtc(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  function monthRange(endYear: number, endMonthIndex: number, count: number): Array<{ year: number; monthIndex: number }> {
    const out: Array<{ year: number; monthIndex: number }> = [];
    let y = endYear;
    let m = endMonthIndex;
    for (let i = 0; i < count; i += 1) {
      out.push({ year: y, monthIndex: m });
      m -= 1;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
    }
    return out.reverse();
  }

  /** First calendar day-of-month billing (adjusted) on or after isoDate (inclusive). */
  function firstBillsExecutionOnOrAfter(afterIso: string, billingDay = 15): string {
    const [sy, sm] = afterIso.split("-").map(Number);
    let cy = sy;
    let cm = sm - 1;
    const candidate = adjustBeforeWeekend(cy, cm, billingDay);
    if (candidate >= afterIso) return candidate;
    cm += 1;
    if (cm > 11) {
      cm = 0;
      cy += 1;
    }
    return adjustBeforeWeekend(cy, cm, billingDay);
  }

  const rng = createRng(RNG_SEED);
  const months = monthRange(RANGE_END_YEAR, RANGE_END_MONTH_INDEX, RANGE_MONTH_COUNT);

  db.transaction(() => {
    for (const { year, monthIndex } of months) {
      const salaryDate = adjustBeforeWeekend(year, monthIndex, 25);
      const billsDate = adjustBeforeWeekend(year, monthIndex, 15);
      const savingDate = adjustBeforeWeekend(year, monthIndex, 20);
      const cardPaymentDate = adjustBeforeWeekend(year, monthIndex, 20);

      // Salary — not standing; only through local today (avoid fake "upcoming" pay).
      if (salaryDate <= todayIso) {
        flow({
          kind: "credit",
          debit_account_id: checking1,
          credit_account_id: null,
          amount_cents: AMOUNTS.paycheck,
          execution_date: salaryDate,
          counterparty_name: "Fondation Le Relais",
          counterparty_iban: "CH22 1111 2222 3333 4444 5",
          execution_mode: null,
          accounting_text: null,
        });
      }

      // Recurring bills — one-time only when billing day has arrived (past or today).
      if (billsDate <= todayIso) {
        for (const bill of RECURRING_BILLS) {
          insertBillOneTime.run({
            debit_account_id: checking1,
            amount_cents: -bill.amountCents,
            execution_date: billsDate,
            beneficiary_name: bill.beneficiaryName,
            beneficiary_iban: bill.beneficiaryIban,
            beneficiary_postal_code: bill.beneficiaryPostalCode,
            beneficiary_city: bill.beneficiaryCity,
            rf_reference: bill.rfReference,
            accounting_text: bill.description,
          });
        }
      }

      if (savingDate <= todayIso) {
        transferOut(checking1, retirementA, AMOUNTS.threeAContribution, savingDate, "Pour ma retraite");
        transferOut(checking1, savings1, AMOUNTS.transferToSavings, savingDate, "Pour mon épargne mensuelle");
      }

      const days = daysInMonthUtc(year, monthIndex);
      for (let day = 1; day <= days; day += 1) {
        const weekday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
        if (weekday === 0) continue;
        const executionDate = isoDateUtc(year, monthIndex, day);
        if (executionDate > todayIso) continue;

        for (const shop of SHOPS) {
          if (rng() > shop.dailyProbability) continue;
          const amountCents = randomLogUniformCents(rng, shop.minCents, shop.maxCents);
          flow({
            kind: "purchaseService",
            debit_account_id: shop.paidWithCard ? cardMain : checking1,
            credit_account_id: null,
            amount_cents: -amountCents,
            execution_date: executionDate,
            counterparty_name: shop.name,
            counterparty_iban: null,
            execution_mode: null,
            accounting_text: null,
          });
        }
      }

      if (cardPaymentDate <= todayIso) {
        transferOut(checking1, cardMain, AMOUNTS.cardPayment, cardPaymentDate, "Pour mes achats en ligne");
      }
    }

    // Next cycle after whatever is already posted today (avoid duplicating today's bill row).
    const nextStandingBillsDate = firstBillsExecutionOnOrAfter(addDaysIsoLocal(todayIso, 1));
    for (const bill of RECURRING_BILLS) {
      insertBillStanding.run({
        debit_account_id: checking1,
        amount_cents: -bill.amountCents,
        execution_date: nextStandingBillsDate,
        first_execution_date: nextStandingBillsDate,
        beneficiary_name: bill.beneficiaryName,
        beneficiary_iban: bill.beneficiaryIban,
        beneficiary_postal_code: bill.beneficiaryPostalCode,
        beneficiary_city: bill.beneficiaryCity,
        rf_reference: bill.rfReference,
        accounting_text: bill.description,
      });
    }
  })();
}
