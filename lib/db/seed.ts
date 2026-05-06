import type Database from "better-sqlite3";

type SeedAccount = {
  category: "checking" | "savings" | "retirement" | "cards";
  name: string;
  identifier: string;
  balance_cents: number;
  sort_order: number;
};

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    category: "checking",
    name: "Checking 01",
    identifier: "CH14 8080 8001 2345 6789 0",
    balance_cents: 1258045,
    sort_order: 1,
  },
  {
    category: "checking",
    name: "Checking 02",
    identifier: "CH77 8080 8009 9999 0000 1",
    balance_cents: 342000,
    sort_order: 2,
  },
  {
    category: "checking",
    name: "Checking 02",
    identifier: "CH77 8080 8009 9999 0000 2",
    balance_cents: -8250,
    sort_order: 3,
  },
  {
    category: "savings",
    name: "Savings 01",
    identifier: "CH93 8080 8000 1111 2222 3",
    balance_cents: 4820000,
    sort_order: 1,
  },
  {
    category: "retirement",
    name: "Retirement A",
    identifier: "PIL-3A-001928",
    balance_cents: 7123015,
    sort_order: 1,
  },
  {
    category: "retirement",
    name: "Retirement B",
    identifier: "PEN-3B-004201",
    balance_cents: 2289000,
    sort_order: 2,
  },
  {
    category: "cards",
    name: "Card Platinum",
    identifier: "XXXX XXXX XXXX 1284",
    balance_cents: -98035,
    sort_order: 1,
  },
  {
    category: "cards",
    name: "Card Travel",
    identifier: "XXXX XXXX XXXX 7741",
    balance_cents: -12000,
    sort_order: 2,
  },
];

type SeedPastTransaction = {
  kind: "purchaseService" | "credit" | "debit";
  date: string;
  amount_cents: number;
  counterparty_name: string;
  counterparty_iban: string;
};

const SEED_PAST_TRANSACTIONS: SeedPastTransaction[] = [
  {
    date: "2026-04-02",
    amount_cents: 620000,
    kind: "credit",
    counterparty_name: "Acme SA",
    counterparty_iban: "CH22 1111 2222 3333 4444 5",
  },
  {
    date: "2026-04-28",
    amount_cents: -12485,
    kind: "purchaseService",
    counterparty_name: "Migros Sevelin",
    counterparty_iban: "CH47 0000 0000 0000 1200 8",
  },
  {
    date: "2026-04-28",
    amount_cents: -4230,
    kind: "purchaseService",
    counterparty_name: "Sun Store",
    counterparty_iban: "CH79 0000 0000 0000 5500 1",
  },
  {
    date: "2026-04-11",
    amount_cents: 50000,
    kind: "credit",
    counterparty_name: "Savings account transfer",
    counterparty_iban: "CH93 8080 8000 1111 2222 3",
  },
  {
    date: "2026-04-30",
    amount_cents: -1850,
    kind: "purchaseService",
    counterparty_name: "Streamly",
    counterparty_iban: "CH73 0000 0000 0000 8899 2",
  },
  {
    date: "2026-04-30",
    amount_cents: 6840,
    kind: "credit",
    counterparty_name: "BlueShop SA",
    counterparty_iban: "CH63 0000 0000 0000 1122 9",
  },
  {
    date: "2026-04-02",
    amount_cents: 12000,
    kind: "credit",
    counterparty_name: "LunchPass",
    counterparty_iban: "CH51 0000 0000 0000 9988 7",
  },
  {
    date: "2026-04-24",
    amount_cents: -32000,
    kind: "debit",
    counterparty_name: "Martin, Elise",
    counterparty_iban: "CH19 4444 5555 6666 7777 8",
  },
];

type SeedUpcomingOrder = {
  date: string;
  description: string;
  type: "pending" | "standing";
  amount_cents: number;
};

const SEED_UPCOMING_ORDERS: SeedUpcomingOrder[] = [
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

export function seedDb(db: Database.Database): void {
  const insertAccount = db.prepare(
    `INSERT INTO accounts (category, name, identifier, balance_cents, currency, sort_order)
     VALUES (@category, @name, @identifier, @balance_cents, 'CHF', @sort_order)`,
  );

  const accountIds: number[] = [];
  const insertAll = db.transaction(() => {
    for (const account of SEED_ACCOUNTS) {
      const result = insertAccount.run(account);
      accountIds.push(Number(result.lastInsertRowid));
    }
  });
  insertAll();

  const firstCheckingId = accountIds[0];

  const insertPastTransaction = db.prepare(
    `INSERT INTO transactions
       (kind, debit_account_id, amount_cents, currency, execution_date,
        counterparty_name, counterparty_iban)
     VALUES
       (@kind, @debit_account_id, @amount_cents, 'CHF', @execution_date,
        @counterparty_name, @counterparty_iban)`,
  );

  const insertUpcoming = db.prepare(
    `INSERT INTO transactions
       (kind, debit_account_id, amount_cents, currency, execution_date,
        accounting_text, payment_type, first_execution_date, frequency)
     VALUES
       ('payment', @debit_account_id, @amount_cents, 'CHF', @execution_date,
        @description, @payment_type, @first_execution_date, @frequency)`,
  );

  const insertSeededTransactions = db.transaction(() => {
    for (const tx of SEED_PAST_TRANSACTIONS) {
      insertPastTransaction.run({
        kind: tx.kind,
        debit_account_id: firstCheckingId,
        amount_cents: tx.amount_cents,
        execution_date: tx.date,
        counterparty_name: tx.counterparty_name,
        counterparty_iban: tx.counterparty_iban,
      });
    }
    for (const order of SEED_UPCOMING_ORDERS) {
      insertUpcoming.run({
        debit_account_id: firstCheckingId,
        amount_cents: order.amount_cents,
        execution_date: order.date,
        description: order.description,
        payment_type: order.type === "standing" ? "standing" : "oneTime",
        first_execution_date: order.type === "standing" ? order.date : null,
        frequency: order.type === "standing" ? "monthly" : null,
      });
    }
  });
  insertSeededTransactions();
}
