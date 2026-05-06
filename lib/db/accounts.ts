import { getDb } from "./client";

export type AccountCategory = "checking" | "savings" | "retirement" | "cards";

export type AccountRow = {
  id: number;
  category: AccountCategory;
  name: string;
  identifier: string;
  balance_cents: number;
  currency: string;
  sort_order: number;
};

export type Account = {
  id: number;
  category: AccountCategory;
  name: string;
  identifier: string;
  balance: number;
  currency: string;
};

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    identifier: row.identifier,
    balance: row.balance_cents / 100,
    currency: row.currency,
  };
}

const CATEGORY_ORDER: AccountCategory[] = [
  "checking",
  "savings",
  "retirement",
  "cards",
];

export type AccountGroup = {
  category: AccountCategory;
  accounts: Account[];
};

export function listAccountsGroupedByCategory(): AccountGroup[] {
  const rows = getDb()
    .prepare(
      `SELECT id, category, name, identifier, balance_cents, currency, sort_order
       FROM accounts
       ORDER BY sort_order ASC, id ASC`,
    )
    .all() as AccountRow[];

  const grouped = new Map<AccountCategory, Account[]>();
  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }
  for (const row of rows) {
    grouped.get(row.category)?.push(rowToAccount(row));
  }

  return CATEGORY_ORDER.map((category) => ({
    category,
    accounts: grouped.get(category) ?? [],
  })).filter((group) => group.accounts.length > 0);
}

export function getAccountById(id: number): Account | null {
  const row = getDb()
    .prepare(
      `SELECT id, category, name, identifier, balance_cents, currency, sort_order
       FROM accounts WHERE id = ?`,
    )
    .get(id) as AccountRow | undefined;
  return row ? rowToAccount(row) : null;
}

export function listSelectableAccounts(): Account[] {
  const rows = getDb()
    .prepare(
      `SELECT id, category, name, identifier, balance_cents, currency, sort_order
       FROM accounts
       WHERE category IN ('checking', 'savings')
       ORDER BY sort_order ASC, id ASC`,
    )
    .all() as AccountRow[];
  return rows.map(rowToAccount);
}
