import type { Tx } from "./client";
import { seedUserSilEbill } from "./ebills";

type SeedAccount = {
  category: "checking" | "savings" | "retirement" | "cards";
  name: string;
  identifier: string;
  sort_order: number;
};

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function randomDigits(rng: () => number, n: number): string {
  let out = "";
  for (let i = 0; i < n; i += 1) out += String(Math.floor(rng() * 10));
  return out;
}

/** Spaced CH IBAN-like string (demo only; checksum not validated). */
function randomChIban(rng: () => number): string {
  const d = randomDigits(rng, 19);
  return `CH${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6, 10)} ${d.slice(10, 14)} ${d.slice(14, 18)} ${d.slice(18)}`;
}

type SeedCard = {
  card_type: "debit" | "credit";
  brand: string;
  pan: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  holder_first_name: string;
  holder_last_name: string;
};

type SeedBundle = {
  accounts: SeedAccount[];
  debitCard: SeedCard;
  creditCard: SeedCard;
};

const CARD_BRANDS = ["Visa", "Mastercard"] as const;

function pickFrom<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)]!;
}

function buildPan(rng: () => number, brand: string, last4: string): string {
  const firstDigit = brand === "Visa" ? "4" : "5";
  return `${firstDigit}${randomDigits(rng, 11)}${last4}`;
}

/** Months [1..12], year offset 2..5 from current year — keeps demo cards valid for a few years. */
function buildExpiry(rng: () => number): { expiry_month: number; expiry_year: number } {
  const month = 1 + Math.floor(rng() * 12);
  const year = new Date().getUTCFullYear() + 2 + Math.floor(rng() * 4);
  return { expiry_month: month, expiry_year: year };
}

/** One account per category; identifiers are unique per user via RNG seeded by `userId`. */
function buildSeedBundle(userId: number): SeedBundle {
  const idRng = createRng((userId * 2654435761) >>> 0);
  const checkingIdentifier = randomChIban(idRng);
  const savingsIdentifier = randomChIban(idRng);
  const retirementIdentifier = `PIL-3A-${randomDigits(idRng, 6)}`;
  const cardLast4 = randomDigits(idRng, 4);
  const cardIdentifier = `XXXX XXXX XXXX ${cardLast4}`;

  const debitBrand = pickFrom(idRng, CARD_BRANDS);
  const debitLast4 = randomDigits(idRng, 4);
  const debitExpiry = buildExpiry(idRng);
  const debitCvv = randomDigits(idRng, 3);

  const creditBrand = pickFrom(idRng, CARD_BRANDS);
  const creditExpiry = buildExpiry(idRng);
  const creditCvv = randomDigits(idRng, 3);

  return {
    accounts: [
      { category: "checking", name: "Checking 01", identifier: checkingIdentifier, sort_order: 1 },
      { category: "savings", name: "Savings 01", identifier: savingsIdentifier, sort_order: 1 },
      { category: "retirement", name: "Retirement A", identifier: retirementIdentifier, sort_order: 1 },
      { category: "cards", name: "Card Main", identifier: cardIdentifier, sort_order: 1 },
    ],
    debitCard: {
      card_type: "debit",
      brand: debitBrand,
      pan: buildPan(idRng, debitBrand, debitLast4),
      ...debitExpiry,
      cvv: debitCvv,
      holder_first_name: "Your first name",
      holder_last_name: "YOUR LAST NAME",
    },
    creditCard: {
      card_type: "credit",
      brand: creditBrand,
      pan: buildPan(idRng, creditBrand, cardLast4),
      ...creditExpiry,
      cvv: creditCvv,
      holder_first_name: "Your first name",
      holder_last_name: "YOUR LAST NAME",
    },
  };
}

async function insertSeedAccountsAndCards(
  tx: Tx,
  userId: number,
): Promise<[number, number, number, number]> {
  const bundle = buildSeedBundle(userId);
  const ids: number[] = [];
  for (const account of bundle.accounts) {
    const id = await tx.insert(
      `INSERT INTO bank_accounts (user_id, category, name, identifier, balance_cents, currency, sort_order)
       VALUES (@user_id, @category, @name, @identifier, 0, 'CHF', @sort_order) RETURNING id`,
      { ...account, user_id: userId },
    );
    ids.push(id);
  }
  const [checkingId, , , cardsId] = ids as [number, number, number, number];

  await insertCard(tx, userId, checkingId, bundle.debitCard);
  await insertCard(tx, userId, cardsId, bundle.creditCard);

  return ids as [number, number, number, number];
}

async function insertCard(tx: Tx, userId: number, accountId: number, card: SeedCard): Promise<void> {
  await tx.run(
    `INSERT INTO bank_cards (
       user_id, account_id, card_type, brand, pan, expiry_month, expiry_year, cvv,
       holder_first_name, holder_last_name
     ) VALUES (
       @user_id, @account_id, @card_type, @brand, @pan, @expiry_month, @expiry_year, @cvv,
       @holder_first_name, @holder_last_name
     )`,
    { user_id: userId, account_id: accountId, ...card },
  );
}

/** Demo ledger spans years N-1, N and N+1; seeded rows are conditionally visible by execution_date. */
export async function seedUserDemo(tx: Tx, userId: number): Promise<void> {
  const [checking1, savings1, retirementA, cardMain] = await insertSeedAccountsAndCards(tx, userId);

  const AMOUNTS = {
    paycheck: 400000,
    rent: 120000,
    healthInsurance: 50000,
    internet: 10000,
    threeAContribution: 100000,
    transferToSavings: 50000,
    cardPayment: 5000,
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

  const RECURRING_BILLS = [
    {
      amountCents: AMOUNTS.rent,
      beneficiaryName: "Cogestim",
      beneficiaryIban: "CH90 8000 0000 0000 1100 3",
      rfReference: "RF18 5390 0754 7034 0000 1123",
      beneficiaryPostalCode: "1003",
      beneficiaryCity: "Lausanne",
      description: "Paiement de mon loyer",
    },
    {
      amountCents: AMOUNTS.healthInsurance,
      beneficiaryName: "Groupe Mutuel",
      beneficiaryIban: "CH09 0077 7700 0000 1234 2",
      rfReference: "RF28 2035 6402 1500 9800 7714",
      beneficiaryPostalCode: "1920",
      beneficiaryCity: "Martigny",
      description: "Paiement de mon assurance maladie",
    },
    {
      amountCents: AMOUNTS.internet,
      beneficiaryName: "Swisscom",
      beneficiaryIban: "CH56 0483 5000 0000 5500 2",
      rfReference: "RF72 9981 4400 0071 5560 2048",
      beneficiaryPostalCode: "3050",
      beneficiaryCity: "Bern",
      description: "Paiement de ma facture Internet",
    },
  ] as const;

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
    is_conditionally_visible: number;
  };

  async function flow(r: FlowRow): Promise<void> {
    await tx.run(
      `INSERT INTO bank_transactions
         (user_id, kind, debit_account_id, credit_account_id, amount_cents, currency, execution_date,
          counterparty_name, counterparty_iban, execution_mode, accounting_text, is_conditionally_visible)
       VALUES (@user_id, @kind, @debit_account_id, @credit_account_id, @amount_cents, 'CHF', @execution_date,
          @counterparty_name, @counterparty_iban, @execution_mode, @accounting_text, @is_conditionally_visible)`,
      {
        user_id: userId,
        kind: r.kind,
        debit_account_id: r.debit_account_id,
        credit_account_id: r.credit_account_id,
        amount_cents: r.amount_cents,
        execution_date: r.execution_date,
        counterparty_name: r.counterparty_name,
        counterparty_iban: r.counterparty_iban,
        execution_mode: r.execution_mode,
        accounting_text: r.accounting_text,
        is_conditionally_visible: r.is_conditionally_visible,
      },
    );
  }

  async function transferOut(
    debitId: number,
    creditId: number,
    amountCents: number,
    executionDate: string,
    accountingText: string | null,
  ): Promise<void> {
    await flow({
      kind: "transfer",
      debit_account_id: debitId,
      credit_account_id: creditId,
      amount_cents: -Math.abs(amountCents),
      execution_date: executionDate,
      counterparty_name: null,
      counterparty_iban: null,
      execution_mode: "immediate",
      accounting_text: accountingText,
      is_conditionally_visible: 1,
    });
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

  function monthRange(startYear: number, endYear: number): Array<{ year: number; monthIndex: number }> {
    const out: Array<{ year: number; monthIndex: number }> = [];
    for (let year = startYear; year <= endYear; year += 1) {
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        out.push({ year, monthIndex });
      }
    }
    return out;
  }

  const rng = createRng(RNG_SEED);
  const currentYear = Number(todayIsoLocal().slice(0, 4));
  const months = monthRange(currentYear - 1, currentYear + 1);
  const standingStartDate = `${currentYear - 1}-01-15`;

  for (const bill of RECURRING_BILLS) {
    await tx.run(
      `INSERT INTO bank_standing_orders (
         user_id, debit_account_id, amount_cents, currency,
         start_date, end_date, frequency, weekend_holiday_rule,
         beneficiary_iban, beneficiary_bic, beneficiary_name, beneficiary_country,
         beneficiary_postal_code, beneficiary_city,
         beneficiary_address1, beneficiary_address2,
         rf_reference, communication_to_beneficiary, accounting_text,
         debtor_name, debtor_country, debtor_postal_code,
         debtor_city, debtor_address1, debtor_address2, is_active, is_cancelled
       ) VALUES (
         @user_id, @debit_account_id, @amount_cents, 'CHF',
         @start_date, NULL, 'monthly', 'before',
         @beneficiary_iban, NULL, @beneficiary_name, 'ch',
         @beneficiary_postal_code, @beneficiary_city,
         NULL, NULL,
         @rf_reference, NULL, @accounting_text,
         NULL, NULL, NULL,
         NULL, NULL, NULL, 1, 0
       )`,
      {
        user_id: userId,
        debit_account_id: checking1,
        amount_cents: -bill.amountCents,
        start_date: standingStartDate,
        beneficiary_name: bill.beneficiaryName,
        beneficiary_iban: bill.beneficiaryIban,
        beneficiary_postal_code: bill.beneficiaryPostalCode,
        beneficiary_city: bill.beneficiaryCity,
        rf_reference: bill.rfReference,
        accounting_text: bill.description,
      },
    );
  }

  for (const { year, monthIndex } of months) {
    const salaryDate = adjustBeforeWeekend(year, monthIndex, 25);
    const savingDate = adjustBeforeWeekend(year, monthIndex, 20);
    const cardPaymentDate = adjustBeforeWeekend(year, monthIndex, 20);

    await flow({
      kind: "credit",
      debit_account_id: checking1,
      credit_account_id: null,
      amount_cents: AMOUNTS.paycheck,
      execution_date: salaryDate,
      counterparty_name: "Fondation Le Relais",
      counterparty_iban: "CH22 1111 2222 3333 4444 5",
      execution_mode: null,
      accounting_text: null,
      is_conditionally_visible: 1,
    });

    await transferOut(checking1, retirementA, AMOUNTS.threeAContribution, savingDate, "Pour ma retraite");
    await transferOut(checking1, savings1, AMOUNTS.transferToSavings, savingDate, "Pour mon épargne mensuelle");

    const days = daysInMonthUtc(year, monthIndex);
    for (let day = 1; day <= days; day += 1) {
      const weekday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
      if (weekday === 0) continue;
      const executionDate = isoDateUtc(year, monthIndex, day);

      for (const shop of SHOPS) {
        if (rng() > shop.dailyProbability) continue;
        const amountCents = randomLogUniformCents(rng, shop.minCents, shop.maxCents);
        await flow({
          kind: "purchaseService",
          debit_account_id: shop.paidWithCard ? cardMain : checking1,
          credit_account_id: null,
          amount_cents: -amountCents,
          execution_date: executionDate,
          counterparty_name: shop.name,
          counterparty_iban: null,
          execution_mode: null,
          accounting_text: null,
          is_conditionally_visible: 1,
        });
      }
    }

    await transferOut(checking1, cardMain, AMOUNTS.cardPayment, cardPaymentDate, "Pour mes achats en ligne");
  }

  await seedUserSilEbill(tx, userId);
}
