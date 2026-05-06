import type Database from "better-sqlite3";

type SeedAccount = {
  category: "checking" | "savings" | "retirement" | "cards";
  name: string;
  identifier: string;
  sort_order: number;
};

/** Two accounts per category; stored `balance_cents` is always 0 — balances come from transactions. */
const SEED_ACCOUNTS: SeedAccount[] = [
  {
    category: "checking",
    name: "Checking 01",
    identifier: "CH14 8080 8001 2345 6789 0",
    sort_order: 1,
  },
  {
    category: "checking",
    name: "Checking 02",
    identifier: "CH77 8080 8009 9999 0000 1",
    sort_order: 2,
  },
  {
    category: "savings",
    name: "Savings 01",
    identifier: "CH93 8080 8000 1111 2222 3",
    sort_order: 1,
  },
  {
    category: "savings",
    name: "Savings 02",
    identifier: "CH10 8080 8000 3333 4444 5",
    sort_order: 2,
  },
  {
    category: "retirement",
    name: "Retirement A",
    identifier: "PIL-3A-001928",
    sort_order: 1,
  },
  {
    category: "retirement",
    name: "Retirement B",
    identifier: "PEN-3B-004201",
    sort_order: 2,
  },
  {
    category: "cards",
    name: "Card Platinum",
    identifier: "XXXX XXXX XXXX 1284",
    sort_order: 1,
  },
  {
    category: "cards",
    name: "Card Travel",
    identifier: "XXXX XXXX XXXX 7741",
    sort_order: 2,
  },
];

export function seedDb(db: Database.Database): void {
  const insertAccount = db.prepare(
    `INSERT INTO accounts (category, name, identifier, balance_cents, currency, sort_order)
     VALUES (@category, @name, @identifier, 0, 'CHF', @sort_order)`,
  );

  let checking1 = 0;
  let checking2 = 0;
  let savings1 = 0;
  let savings2 = 0;
  let retirementA = 0;
  let retirementB = 0;
  let cardPlatinum = 0;
  let cardTravel = 0;

  db.transaction(() => {
    let i = 0;
    for (const account of SEED_ACCOUNTS) {
      insertAccount.run(account);
      const id = i + 1;
      switch (i) {
        case 0:
          checking1 = id;
          break;
        case 1:
          checking2 = id;
          break;
        case 2:
          savings1 = id;
          break;
        case 3:
          savings2 = id;
          break;
        case 4:
          retirementA = id;
          break;
        case 5:
          retirementB = id;
          break;
        case 6:
          cardPlatinum = id;
          break;
        case 7:
          cardTravel = id;
          break;
        default:
          break;
      }
      i += 1;
    }
  })();

  const insertPastFlow = db.prepare(
    `INSERT INTO transactions
       (kind, debit_account_id, credit_account_id, amount_cents, currency, execution_date,
        counterparty_name, counterparty_iban, execution_mode, accounting_text)
     VALUES (@kind, @debit_account_id, @credit_account_id, @amount_cents, 'CHF', @execution_date,
        @counterparty_name, @counterparty_iban, @execution_mode, @accounting_text)`,
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

  /** Move `amountCents` from debit to credit (stored amount is negative). */
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

  const insertUpcomingPayment = db.prepare(
    `INSERT INTO transactions
       (kind, debit_account_id, amount_cents, currency, execution_date,
        accounting_text, payment_type, first_execution_date, frequency)
     VALUES
       ('payment', @debit_account_id, @amount_cents, 'CHF', @execution_date,
        @description, @payment_type, @first_execution_date, @frequency)`,
  );

  // --- Past activity (mostly April 2026; “today” in app is ~May 2026) ---

  // Checking 01 — salary, shopping, inbound from savings
  flow({
    kind: "credit",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: 620000,
    execution_date: "2026-04-02",
    counterparty_name: "Acme SA",
    counterparty_iban: "CH22 1111 2222 3333 4444 5",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: -12485,
    execution_date: "2026-04-28",
    counterparty_name: "Migros Sevelin",
    counterparty_iban: "CH47 0000 0000 0000 1200 8",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: -4230,
    execution_date: "2026-04-28",
    counterparty_name: "Sun Store",
    counterparty_iban: "CH79 0000 0000 0000 5500 1",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: 12000,
    execution_date: "2026-04-02",
    counterparty_name: "LunchPass",
    counterparty_iban: "CH51 0000 0000 0000 9988 7",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: -1850,
    execution_date: "2026-04-30",
    counterparty_name: "Streamly",
    counterparty_iban: "CH73 0000 0000 0000 8899 2",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: 6840,
    execution_date: "2026-04-30",
    counterparty_name: "BlueShop SA",
    counterparty_iban: "CH63 0000 0000 0000 1122 9",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "debit",
    debit_account_id: checking1,
    credit_account_id: null,
    amount_cents: -32000,
    execution_date: "2026-04-24",
    counterparty_name: "Martin, Elise",
    counterparty_iban: "CH19 4444 5555 6666 7777 8",
    execution_mode: null,
    accounting_text: null,
  });
  transferOut(savings1, checking1, 250000, "2026-04-15", "Savings to checking");
  transferOut(checking1, checking2, 50000, "2026-04-10", "Shared household pot");

  // Card payments from Checking 01
  transferOut(checking1, cardPlatinum, 40000, "2026-04-29", "Card payment — Platinum");
  transferOut(checking1, cardTravel, 8000, "2026-03-18", "Card payment — Travel");

  // Checking 02 — freelance, rent, shopping
  flow({
    kind: "credit",
    debit_account_id: checking2,
    credit_account_id: null,
    amount_cents: 420000,
    execution_date: "2026-04-05",
    counterparty_name: "Studio Nord Sàrl",
    counterparty_iban: "CH88 3000 0000 0000 8800 1",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "debit",
    debit_account_id: checking2,
    credit_account_id: null,
    amount_cents: -180000,
    execution_date: "2026-04-01",
    counterparty_name: "ImmoPlus SA",
    counterparty_iban: "CH90 8000 0000 0000 1100 3",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: checking2,
    credit_account_id: null,
    amount_cents: -8735,
    execution_date: "2026-04-22",
    counterparty_name: "Coop City",
    counterparty_iban: "CH12 0483 0840 0012 3456 7",
    execution_mode: null,
    accounting_text: null,
  });

  // Savings 01 — opening credit, outbound to checking (double-count avoided: one transfer row)
  flow({
    kind: "credit",
    debit_account_id: savings1,
    credit_account_id: null,
    amount_cents: 1250000,
    execution_date: "2026-04-01",
    counterparty_name: "Initial transfer",
    counterparty_iban: "CH00 0000 0000 0000 0000 0",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: savings1,
    credit_account_id: null,
    amount_cents: 2100,
    execution_date: "2026-04-30",
    counterparty_name: "Quarterly savings interest",
    counterparty_iban: "CH00 8080 8000 0000 0099 1",
    execution_mode: null,
    accounting_text: null,
  });

  // Savings 02 — balance build + voluntary pension sweep
  flow({
    kind: "credit",
    debit_account_id: savings2,
    credit_account_id: null,
    amount_cents: 650000,
    execution_date: "2026-04-01",
    counterparty_name: "Bonus payout",
    counterparty_iban: "CH00 0900 0000 4455 6677 2",
    execution_mode: null,
    accounting_text: null,
  });
  transferOut(savings2, retirementB, 150000, "2026-04-28", "Voluntary BVG top-up");

  // Retirement — employer-style credits onto pillar accounts
  flow({
    kind: "credit",
    debit_account_id: retirementA,
    credit_account_id: null,
    amount_cents: 950000,
    execution_date: "2026-04-03",
    counterparty_name: "Employer — March pillar",
    counterparty_iban: "CH00 3000 0000 7788 9900 1",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: retirementA,
    credit_account_id: null,
    amount_cents: 920000,
    execution_date: "2026-04-03",
    counterparty_name: "Employer — February pillar",
    counterparty_iban: "CH00 3000 0000 7788 9900 1",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: retirementA,
    credit_account_id: null,
    amount_cents: 400000,
    execution_date: "2026-04-03",
    counterparty_name: "Employer — January pillar",
    counterparty_iban: "CH00 3000 0000 7788 9900 1",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "credit",
    debit_account_id: retirementB,
    credit_account_id: null,
    amount_cents: 1180000,
    execution_date: "2026-04-07",
    counterparty_name: "Employer — BVG regular",
    counterparty_iban: "CH00 3000 0000 7788 9900 1",
    execution_mode: null,
    accounting_text: null,
  });

  // Credit cards — card is debit side for merchant spend
  flow({
    kind: "purchaseService",
    debit_account_id: cardPlatinum,
    credit_account_id: null,
    amount_cents: -45050,
    execution_date: "2026-04-12",
    counterparty_name: "Globus Food Hall",
    counterparty_iban: "CH61 8148 7000 0011 4455 0",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: cardPlatinum,
    credit_account_id: null,
    amount_cents: -22000,
    execution_date: "2026-04-26",
    counterparty_name: "Shell Stations",
    counterparty_iban: "CH12 0863 0863 0863 0001 9",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: cardTravel,
    credit_account_id: null,
    amount_cents: -8900,
    execution_date: "2026-04-17",
    counterparty_name: "SBB Mobile",
    counterparty_iban: "CH12 0761 0761 0761 0002 8",
    execution_mode: null,
    accounting_text: null,
  });
  flow({
    kind: "purchaseService",
    debit_account_id: cardTravel,
    credit_account_id: null,
    amount_cents: -18500,
    execution_date: "2026-04-03",
    counterparty_name: "City Hotel Zurich",
    counterparty_iban: "CH22 0888 0888 0012 3000 4",
    execution_mode: null,
    accounting_text: null,
  });

  const upcomingOrders: {
    date: string;
    description: string;
    type: "pending" | "standing";
    amount_cents: number;
  }[] = [
    {
      date: "2026-05-10",
      description: "Electricity bill - Romande Energie",
      type: "pending",
      amount_cents: -14520,
    },
    {
      date: "2026-05-18",
      description: "Monthly rent transfer",
      type: "standing",
      amount_cents: -185000,
    },
    {
      date: "2026-05-29",
      description: "Mobile plan - Swisscom",
      type: "standing",
      amount_cents: -7990,
    },
  ];

  db.transaction(() => {
    for (const order of upcomingOrders) {
      insertUpcomingPayment.run({
        debit_account_id: checking1,
        amount_cents: order.amount_cents,
        execution_date: order.date,
        description: order.description,
        payment_type: order.type === "standing" ? "standing" : "oneTime",
        first_execution_date: order.type === "standing" ? order.date : null,
        frequency: order.type === "standing" ? "monthly" : null,
      });
    }
  })();
}
