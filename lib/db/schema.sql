CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'))
);

-- Optional one-time backfill for DBs that already contained users before this table existed:
-- see lib/db/backfill-legacy-user-profiles.sql
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('checking', 'savings', 'retirement', 'cards')),
  name TEXT NOT NULL,
  identifier TEXT NOT NULL,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('payment', 'transfer', 'purchaseService', 'credit', 'debit')),
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
  debit_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  credit_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  execution_date TEXT,
  accounting_text TEXT,

  beneficiary_iban TEXT,
  beneficiary_bic TEXT,
  beneficiary_name TEXT,
  beneficiary_country TEXT,
  beneficiary_postal_code TEXT,
  beneficiary_city TEXT,
  beneficiary_address1 TEXT,
  beneficiary_address2 TEXT,
  payment_type TEXT,
  first_execution_date TEXT,
  frequency TEXT,
  weekend_holiday_rule TEXT,
  period_type TEXT,
  end_date TEXT,
  is_express INTEGER,
  rf_reference TEXT,
  communication_to_beneficiary TEXT,
  debtor_name TEXT,
  debtor_country TEXT,
  debtor_postal_code TEXT,
  debtor_city TEXT,
  debtor_address1 TEXT,
  debtor_address2 TEXT,

  execution_mode TEXT,
  is_conditionally_visible INTEGER NOT NULL DEFAULT 0,

  counterparty_name TEXT,
  counterparty_iban TEXT
);

CREATE TABLE IF NOT EXISTS standing_orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
  debit_account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  start_date TEXT NOT NULL,
  end_date TEXT,
  frequency TEXT NOT NULL,
  weekend_holiday_rule TEXT NOT NULL DEFAULT 'after',
  beneficiary_iban TEXT,
  beneficiary_bic TEXT,
  beneficiary_name TEXT,
  beneficiary_country TEXT,
  beneficiary_postal_code TEXT,
  beneficiary_city TEXT,
  beneficiary_address1 TEXT,
  beneficiary_address2 TEXT,
  rf_reference TEXT,
  communication_to_beneficiary TEXT,
  accounting_text TEXT,
  debtor_name TEXT,
  debtor_country TEXT,
  debtor_postal_code TEXT,
  debtor_city TEXT,
  debtor_address1 TEXT,
  debtor_address2 TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_cancelled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cards (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  brand TEXT NOT NULL,
  pan TEXT NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER NOT NULL,
  cvv TEXT NOT NULL,
  holder_first_name TEXT NOT NULL,
  holder_last_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_debit_account ON transactions(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_account ON transactions(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_execution_date ON transactions(execution_date);
CREATE INDEX IF NOT EXISTS idx_standing_orders_user ON standing_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_standing_orders_debit_account ON standing_orders(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_standing_orders_start_date ON standing_orders(start_date);
CREATE INDEX IF NOT EXISTS idx_transactions_beneficiary_iban ON transactions(beneficiary_iban);
CREATE INDEX IF NOT EXISTS idx_standing_orders_beneficiary_iban ON standing_orders(beneficiary_iban);
CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_account ON cards(account_id);
