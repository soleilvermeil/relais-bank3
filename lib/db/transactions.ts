import { getDb } from "./client";

export type TransactionKind =
  | "payment"
  | "transfer"
  | "purchaseService"
  | "credit"
  | "debit";

export type TransactionRow = {
  id: number;
  user_id: number;
  kind: TransactionKind;
  created_at: string;
  debit_account_id: number | null;
  credit_account_id: number | null;
  amount_cents: number;
  currency: string;
  execution_date: string | null;
  accounting_text: string | null;

  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  payment_type: string | null;
  first_execution_date: string | null;
  frequency: string | null;
  weekend_holiday_rule: string | null;
  period_type: string | null;
  end_date: string | null;
  is_express: number | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;

  execution_mode: string | null;
  is_conditionally_visible: number;

  counterparty_name: string | null;
  counterparty_iban: string | null;
};

export type Transaction = Omit<TransactionRow, "id" | "amount_cents" | "is_express" | "is_conditionally_visible"> & {
  id: number | string;
  amount: number;
  is_express: boolean | null;
  is_conditionally_visible: boolean;
};

export type StandingOrderFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export type StandingOrderRow = {
  id: number;
  user_id: number;
  created_at: string;
  debit_account_id: number;
  amount_cents: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  frequency: StandingOrderFrequency;
  weekend_holiday_rule: string;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  accounting_text: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
  is_active: number;
  is_cancelled: number;
};

export type StandingOrderOccurrenceDetail = {
  syntheticId: string;
  execution_date: string;
  standingOrder: StandingOrderRow;
};

const STANDING_ORDER_SYNTHETIC_PREFIX = "so";
const UPCOMING_STANDING_HORIZON_DAYS = 365;

function todayIsoLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const outDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${outMonth}-${outDay}`;
}

function lastDayOfMonthUtc(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonthsClampedIso(iso: string, months: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const baseMonthIndex = month - 1;
  const totalMonths = baseMonthIndex + months;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;
  const targetDay = Math.min(day, lastDayOfMonthUtc(targetYear, targetMonthIndex));
  const outMonth = String(targetMonthIndex + 1).padStart(2, "0");
  const outDay = String(targetDay).padStart(2, "0");
  return `${targetYear}-${outMonth}-${outDay}`;
}

function adjustWeekendRule(iso: string, rule: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  if (weekday === 6) {
    date.setUTCDate(date.getUTCDate() + (rule === "before" ? -1 : 2));
  } else if (weekday === 0) {
    date.setUTCDate(date.getUTCDate() + (rule === "before" ? -2 : 1));
  }
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const outDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${outMonth}-${outDay}`;
}

function nextFrequencyDate(iso: string, frequency: StandingOrderFrequency): string {
  if (frequency === "weekly") return addDaysIso(iso, 7);
  if (frequency === "monthly") return addMonthsClampedIso(iso, 1);
  if (frequency === "quarterly") return addMonthsClampedIso(iso, 3);
  return addMonthsClampedIso(iso, 12);
}

function syntheticStandingOrderId(standingOrderId: number, executionDate: string): string {
  return `${STANDING_ORDER_SYNTHETIC_PREFIX}:${standingOrderId}:${executionDate}`;
}

function parseSyntheticStandingOrderId(value: string): { standingOrderId: number; executionDate: string } | null {
  const [prefix, idRaw, executionDate, ...rest] = value.split(":");
  if (rest.length > 0 || prefix !== STANDING_ORDER_SYNTHETIC_PREFIX) return null;
  const standingOrderId = Number(idRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(executionDate)) return null;
  return { standingOrderId, executionDate };
}

function listStandingOrdersForAccount(accountId: number, userId: number): StandingOrderRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM standing_orders
       WHERE debit_account_id = @id AND user_id = @userId AND (is_active = 1 OR is_cancelled = 1)
       ORDER BY id ASC`,
    )
    .all({ id: accountId, userId }) as StandingOrderRow[];
}

function listAllStandingOrders(userId: number): StandingOrderRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM standing_orders
       WHERE user_id = @userId AND (is_active = 1 OR is_cancelled = 1)
       ORDER BY id ASC`,
    )
    .all({ userId }) as StandingOrderRow[];
}

function listStandingExecutionDates(order: StandingOrderRow, fromIso: string, toIso: string): string[] {
  const out: string[] = [];
  let raw = order.start_date;
  let guard = 0;
  while (guard < 5000) {
    guard += 1;
    const execution = adjustWeekendRule(raw, order.weekend_holiday_rule);
    if (execution > toIso && raw > toIso) break;
    if (
      execution >= fromIso &&
      execution <= toIso &&
      (order.end_date == null || execution <= order.end_date)
    ) {
      out.push(execution);
    }
    if (order.end_date != null && raw > order.end_date) break;
    raw = nextFrequencyDate(raw, order.frequency);
  }
  return out;
}

function standingOrderOccurrenceToTransaction(
  order: StandingOrderRow,
  accountId: number,
  executionDate: string,
): Transaction {
  const rowLike: TransactionRow = {
    id: order.id,
    user_id: order.user_id,
    kind: "payment",
    created_at: order.created_at,
    debit_account_id: order.debit_account_id,
    credit_account_id: null,
    amount_cents: order.amount_cents,
    currency: order.currency,
    execution_date: executionDate,
    accounting_text: order.accounting_text,
    beneficiary_iban: order.beneficiary_iban,
    beneficiary_bic: order.beneficiary_bic,
    beneficiary_name: order.beneficiary_name,
    beneficiary_country: order.beneficiary_country,
    beneficiary_postal_code: order.beneficiary_postal_code,
    beneficiary_city: order.beneficiary_city,
    beneficiary_address1: order.beneficiary_address1,
    beneficiary_address2: order.beneficiary_address2,
    payment_type: "standing",
    first_execution_date: order.start_date,
    frequency: order.frequency,
    weekend_holiday_rule: order.weekend_holiday_rule,
    period_type: order.end_date == null ? "unlimited" : "endDate",
    end_date: order.end_date,
    is_express: 0,
    rf_reference: order.rf_reference,
    communication_to_beneficiary: order.communication_to_beneficiary,
    debtor_name: order.debtor_name,
    debtor_country: order.debtor_country,
    debtor_postal_code: order.debtor_postal_code,
    debtor_city: order.debtor_city,
    debtor_address1: order.debtor_address1,
    debtor_address2: order.debtor_address2,
    execution_mode: null,
    is_conditionally_visible: 0,
    counterparty_name: null,
    counterparty_iban: null,
  };
  return {
    ...rowToTransaction(rowLike, accountId),
    id: syntheticStandingOrderId(order.id, executionDate),
  };
}

function rowToTransaction(row: TransactionRow, accountId: number): Transaction {
  const { amount_cents, is_express, is_conditionally_visible, ...rest } = row;
  const amountForAccount =
    row.kind === "transfer" && row.credit_account_id === accountId
      ? Math.abs(amount_cents)
      : amount_cents;
  return {
    ...rest,
    amount: amountForAccount / 100,
    is_express:
      is_express === null ? null : is_express === 1,
    is_conditionally_visible: is_conditionally_visible === 1,
  };
}

export function listTransactionsForAccount(accountId: number, userId: number): Transaction[] {
  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  const rows = getDb()
    .prepare(
      `SELECT * FROM transactions
       WHERE user_id = @userId
         AND (debit_account_id = @id OR credit_account_id = @id)
         AND (
           is_conditionally_visible = 0
           OR (is_conditionally_visible = 1 AND execution_date <= date('now', 'localtime'))
         )
       ORDER BY execution_date DESC, id DESC`,
    )
    .all({ id: accountId, userId }) as TransactionRow[];
  const persisted = rows.map((row) => rowToTransaction(row, accountId));
  const standingOrders = listStandingOrdersForAccount(accountId, userId);
  const standingOccurrences = standingOrders.flatMap((order) =>
    listStandingExecutionDates(order, order.start_date, horizon).map((executionDate) =>
      standingOrderOccurrenceToTransaction(order, accountId, executionDate),
    ),
  );
  const merged = [...persisted, ...standingOccurrences];
  merged.sort((a, b) => {
    const dateA = a.execution_date ?? "";
    const dateB = b.execution_date ?? "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return String(b.id).localeCompare(String(a.id));
  });
  return merged;
}

export function getTransactionById(id: number, userId: number): TransactionRow | null {
  const row = getDb()
    .prepare(`SELECT * FROM transactions WHERE id = @id AND user_id = @userId`)
    .get({ id, userId }) as TransactionRow | undefined;
  return row ?? null;
}

/** Net CHF cents for an account: debits use stored amount; transfers credit the other leg with -amount. */
export function computeBalanceCentsForAccount(accountId: number, userId: number): number {
  const row = getDb()
    .prepare(
      `SELECT
         COALESCE((
           SELECT SUM(amount_cents)
           FROM transactions
           WHERE user_id = @userId
             AND debit_account_id = @id
             AND (
               is_conditionally_visible = 0
               OR (is_conditionally_visible = 1 AND execution_date <= date('now', 'localtime'))
             )
         ), 0)
         + COALESCE(
           (
             SELECT SUM(-amount_cents)
             FROM transactions
             WHERE user_id = @userId
               AND credit_account_id = @id
               AND kind = 'transfer'
               AND (
                 is_conditionally_visible = 0
                 OR (is_conditionally_visible = 1 AND execution_date <= date('now', 'localtime'))
               )
           ),
           0
         ) AS balance_cents`,
    )
    .get({ id: accountId, userId }) as { balance_cents: number };
  const standingOrders = listStandingOrdersForAccount(accountId, userId);
  const today = todayIsoLocal();
  let standingCents = 0;
  for (const order of standingOrders) {
    standingCents += listStandingExecutionDates(order, order.start_date, today).length * order.amount_cents;
  }
  return row.balance_cents + standingCents;
}

/** One round-trip: map account id -> net balance in cents from all transactions. */
export function computeBalanceCentsByAccountId(userId: number): Map<number, number> {
  const rows = getDb()
    .prepare(
      `SELECT a.id AS account_id,
         COALESCE(d.debit_sum, 0) + COALESCE(c.credit_transfer_sum, 0) AS balance_cents
       FROM accounts a
       LEFT JOIN (
         SELECT debit_account_id AS id, SUM(amount_cents) AS debit_sum
         FROM transactions
         WHERE user_id = @userId
           AND debit_account_id IS NOT NULL
           AND (
             is_conditionally_visible = 0
             OR (is_conditionally_visible = 1 AND execution_date <= date('now', 'localtime'))
           )
         GROUP BY debit_account_id
       ) d ON d.id = a.id
       LEFT JOIN (
         SELECT credit_account_id AS id, SUM(-amount_cents) AS credit_transfer_sum
         FROM transactions
         WHERE user_id = @userId
           AND credit_account_id IS NOT NULL
           AND kind = 'transfer'
           AND (
             is_conditionally_visible = 0
             OR (is_conditionally_visible = 1 AND execution_date <= date('now', 'localtime'))
           )
         GROUP BY credit_account_id
       ) c ON c.id = a.id
       WHERE a.user_id = @userId`,
    )
    .all({ userId }) as { account_id: number; balance_cents: number }[];

  const map = new Map<number, number>();
  for (const r of rows) {
    map.set(r.account_id, r.balance_cents);
  }
  const today = todayIsoLocal();
  const standingOrders = listAllStandingOrders(userId);
  for (const order of standingOrders) {
    const occurrenceCount = listStandingExecutionDates(order, order.start_date, today).length;
    if (occurrenceCount === 0) continue;
    const current = map.get(order.debit_account_id) ?? 0;
    map.set(order.debit_account_id, current + occurrenceCount * order.amount_cents);
  }
  return map;
}

export type PaymentInsertInput = {
  user_id: number;
  debit_account_id: number;
  amount_cents: number;
  execution_date: string | null;
  accounting_text: string | null;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  payment_type: "oneTime" | "standing" | null;
  first_execution_date: string | null;
  frequency: string | null;
  weekend_holiday_rule: string | null;
  period_type: string | null;
  end_date: string | null;
  is_express: boolean;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
};

export function insertPayment(input: PaymentInsertInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO transactions (
         user_id, kind, debit_account_id, amount_cents, currency,
         execution_date, accounting_text,
         beneficiary_iban, beneficiary_bic, beneficiary_name, beneficiary_country,
         beneficiary_postal_code, beneficiary_city,
         beneficiary_address1, beneficiary_address2,
         payment_type, first_execution_date, frequency,
         weekend_holiday_rule, period_type, end_date,
         is_express, rf_reference, communication_to_beneficiary,
         debtor_name, debtor_country, debtor_postal_code, is_conditionally_visible,
         debtor_city, debtor_address1, debtor_address2
       ) VALUES (
         @user_id, 'payment', @debit_account_id, @amount_cents, 'CHF',
         @execution_date, @accounting_text,
         @beneficiary_iban, @beneficiary_bic, @beneficiary_name, @beneficiary_country,
         @beneficiary_postal_code, @beneficiary_city,
         @beneficiary_address1, @beneficiary_address2,
         @payment_type, @first_execution_date, @frequency,
         @weekend_holiday_rule, @period_type, @end_date,
         @is_express, @rf_reference, @communication_to_beneficiary,
         @debtor_name, @debtor_country, @debtor_postal_code, 0,
         @debtor_city, @debtor_address1, @debtor_address2
       )`,
    )
    .run({
      ...input,
      is_express: input.is_express ? 1 : 0,
    });
  return Number(result.lastInsertRowid);
}

export type StandingOrderInsertInput = {
  user_id: number;
  debit_account_id: number;
  amount_cents: number;
  start_date: string;
  end_date: string | null;
  frequency: StandingOrderFrequency;
  weekend_holiday_rule: string;
  beneficiary_iban: string | null;
  beneficiary_bic: string | null;
  beneficiary_name: string | null;
  beneficiary_country: string | null;
  beneficiary_postal_code: string | null;
  beneficiary_city: string | null;
  beneficiary_address1: string | null;
  beneficiary_address2: string | null;
  rf_reference: string | null;
  communication_to_beneficiary: string | null;
  accounting_text: string | null;
  debtor_name: string | null;
  debtor_country: string | null;
  debtor_postal_code: string | null;
  debtor_city: string | null;
  debtor_address1: string | null;
  debtor_address2: string | null;
};

export function insertStandingOrder(input: StandingOrderInsertInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO standing_orders (
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
         @start_date, @end_date, @frequency, @weekend_holiday_rule,
         @beneficiary_iban, @beneficiary_bic, @beneficiary_name, @beneficiary_country,
         @beneficiary_postal_code, @beneficiary_city,
         @beneficiary_address1, @beneficiary_address2,
         @rf_reference, @communication_to_beneficiary, @accounting_text,
         @debtor_name, @debtor_country, @debtor_postal_code,
         @debtor_city, @debtor_address1, @debtor_address2, 1, 0
       )`,
    )
    .run(input);
  return Number(result.lastInsertRowid);
}

export function pauseStandingOrder(id: number, userId: number): void {
  getDb()
    .prepare(
      `UPDATE standing_orders
       SET is_active = 0
       WHERE id = @id AND user_id = @userId`,
    )
    .run({ id, userId });
}

export function deleteStandingOrder(id: number, userId: number): void {
  getDb()
    .prepare(
      `UPDATE standing_orders
       SET
         end_date = CASE
           WHEN end_date IS NULL OR end_date > date('now', 'localtime') THEN date('now', 'localtime')
           ELSE end_date
         END,
         is_active = 0,
         is_cancelled = 1
       WHERE id = @id AND user_id = @userId`,
    )
    .run({ id, userId });
}

export function deleteFuturePendingOrderTransaction(id: number, userId: number): void {
  getDb()
    .prepare(
      `DELETE FROM transactions
       WHERE id = @id AND user_id = @userId
         AND execution_date > date('now', 'localtime')
         AND (
           kind = 'transfer'
           OR (kind = 'payment' AND COALESCE(payment_type, 'oneTime') != 'standing')
         )`,
    )
    .run({ id, userId });
}

export type TransferInsertInput = {
  user_id: number;
  debit_account_id: number;
  credit_account_id: number;
  amount_cents: number;
  execution_mode: "immediate" | "date";
  execution_date: string | null;
  accounting_text: string | null;
};

export function insertTransfer(input: TransferInsertInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO transactions (
         user_id, kind, debit_account_id, credit_account_id, amount_cents, currency,
         execution_mode, execution_date, accounting_text, is_conditionally_visible
       ) VALUES (
         @user_id, 'transfer', @debit_account_id, @credit_account_id, @amount_cents, 'CHF',
         @execution_mode, @execution_date, @accounting_text, 0
       )`,
    )
    .run(input);
  return Number(result.lastInsertRowid);
}

export function getStandingOrderOccurrenceBySyntheticId(
  syntheticId: string,
  userId: number,
): StandingOrderOccurrenceDetail | null {
  const parsed = parseSyntheticStandingOrderId(syntheticId);
  if (!parsed) return null;
  const standingOrder = getDb()
    .prepare(`SELECT * FROM standing_orders WHERE id = @id AND user_id = @userId`)
    .get({ id: parsed.standingOrderId, userId }) as StandingOrderRow | undefined;
  if (!standingOrder) return null;
  const matches = listStandingExecutionDates(
    standingOrder,
    parsed.executionDate,
    parsed.executionDate,
  );
  if (matches.length === 0) return null;
  return {
    syntheticId,
    execution_date: parsed.executionDate,
    standingOrder,
  };
}

/** `so:{standingOrderId}` only — not an occurrence (`so:id:date`). */
export function parseStandingOrderSummarySoId(value: string): number | null {
  const parts = value.split(":");
  if (parts.length !== 2) return null;
  const [prefix, idRaw] = parts;
  if (prefix !== STANDING_ORDER_SYNTHETIC_PREFIX) return null;
  const standingOrderId = Number(idRaw);
  if (!Number.isFinite(standingOrderId) || standingOrderId <= 0) return null;
  return standingOrderId;
}

export function getStandingOrderById(id: number, userId: number): StandingOrderRow | null {
  const row = getDb()
    .prepare(`SELECT * FROM standing_orders WHERE id = @id AND user_id = @userId`)
    .get({ id, userId }) as StandingOrderRow | undefined;
  return row ?? null;
}

/** Next execution in the standing-horizon window, or last past execution, or `start_date`. */
export function nextStandingExecutionForSummary(order: StandingOrderRow): string {
  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  const futureDates = listStandingExecutionDates(order, today, horizon);
  if (futureDates.length > 0) return futureDates[0]!;
  const pastDates = listStandingExecutionDates(order, order.start_date, today);
  if (pastDates.length > 0) return pastDates[pastDates.length - 1]!;
  return order.start_date;
}

/** Whether the schedule still has at least one execution strictly after today. */
export function standingOrderHasFutureExecution(order: StandingOrderRow): boolean {
  const today = todayIsoLocal();
  const horizon = addDaysIso(today, UPCOMING_STANDING_HORIZON_DAYS);
  return listStandingExecutionDates(order, addDaysIso(today, 1), horizon).length > 0;
}
