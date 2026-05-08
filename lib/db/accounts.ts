import { dbAll, dbGet } from "./client";
import {
  computeBalanceCentsByAccountId,
  computeBalanceCentsForAccount,
} from "./transactions";
import type { TFunction } from "i18next";

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

function rowToAccount(row: AccountRow, balanceCentsFromTx: number): Account {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    identifier: row.identifier,
    balance: balanceCentsFromTx / 100,
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

function categoryBaseLabelKey(category: AccountCategory): string {
  if (category === "cards") return "card";
  return category;
}

export function localizedAccountName(
  category: AccountCategory,
  index: number,
  totalInCategory: number,
  t: TFunction,
): string {
  const baseLabel = t(`bankWealth.accountLabels.${categoryBaseLabelKey(category)}`);
  if (totalInCategory === 1) {
    return t("bankWealth.naming.main", { base: baseLabel });
  }
  return t("bankWealth.naming.numbered", { base: baseLabel, index });
}

export function localizeAccounts(accounts: Account[], t: TFunction): Account[] {
  const totalByCategory = new Map<AccountCategory, number>();
  const indexByCategory = new Map<AccountCategory, number>();

  for (const account of accounts) {
    totalByCategory.set(account.category, (totalByCategory.get(account.category) ?? 0) + 1);
  }

  return accounts.map((account) => {
    const index = (indexByCategory.get(account.category) ?? 0) + 1;
    indexByCategory.set(account.category, index);
    const totalInCategory = totalByCategory.get(account.category) ?? 1;

    return {
      ...account,
      name: localizedAccountName(account.category, index, totalInCategory, t),
    };
  });
}

export function localizeAccountGroups(groups: AccountGroup[], t: TFunction): AccountGroup[] {
  return groups.map((group) => ({
    ...group,
    accounts: localizeAccounts(group.accounts, t),
  }));
}

export async function listAccountsGroupedByCategory(userId: number): Promise<AccountGroup[]> {
  const rows = await dbAll<AccountRow>(
    `SELECT id, category, name, identifier, balance_cents, currency, sort_order
     FROM accounts
     WHERE user_id = @userId
     ORDER BY sort_order ASC, id ASC`,
    { userId },
  );

  const balances = await computeBalanceCentsByAccountId(userId);

  const grouped = new Map<AccountCategory, Account[]>();
  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }
  for (const row of rows) {
    const cents = balances.get(row.id) ?? 0;
    grouped.get(row.category)?.push(rowToAccount(row, cents));
  }

  return CATEGORY_ORDER.map((category) => ({
    category,
    accounts: grouped.get(category) ?? [],
  })).filter((group) => group.accounts.length > 0);
}

export async function getAccountById(userId: number, id: number): Promise<Account | null> {
  const row = await dbGet<AccountRow>(
    `SELECT id, category, name, identifier, balance_cents, currency, sort_order
     FROM accounts WHERE id = @id AND user_id = @userId`,
    { id, userId },
  );
  if (!row) return null;
  const cents = await computeBalanceCentsForAccount(id, userId);
  return rowToAccount(row, cents);
}

export async function listSelectableAccounts(userId: number): Promise<Account[]> {
  const rows = await dbAll<AccountRow>(
    `SELECT id, category, name, identifier, balance_cents, currency, sort_order
     FROM accounts
     WHERE user_id = @userId AND category IN ('checking', 'savings')
     ORDER BY sort_order ASC, id ASC`,
    { userId },
  );
  const balances = await computeBalanceCentsByAccountId(userId);
  return rows.map((row) => rowToAccount(row, balances.get(row.id) ?? 0));
}
