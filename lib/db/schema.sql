CREATE TABLE IF NOT EXISTS bank_users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_updated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_users_email_lower ON bank_users (LOWER(TRIM(email)))
  WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS bank_accounts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('checking', 'savings', 'retirement', 'cards')),
  name TEXT NOT NULL,
  identifier TEXT NOT NULL,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('payment', 'transfer', 'purchaseService', 'credit', 'debit')),
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
  debit_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
  credit_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS bank_standing_orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
  debit_account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS bank_cards (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  brand TEXT NOT NULL,
  pan TEXT NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER NOT NULL,
  cvv TEXT NOT NULL,
  holder_first_name TEXT NOT NULL,
  holder_last_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_debit_account ON bank_transactions(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_credit_account ON bank_transactions(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_execution_date ON bank_transactions(execution_date);
CREATE INDEX IF NOT EXISTS idx_bank_standing_orders_user ON bank_standing_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_standing_orders_debit_account ON bank_standing_orders(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_standing_orders_start_date ON bank_standing_orders(start_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_beneficiary_iban ON bank_transactions(beneficiary_iban);
CREATE INDEX IF NOT EXISTS idx_bank_standing_orders_beneficiary_iban ON bank_standing_orders(beneficiary_iban);
CREATE INDEX IF NOT EXISTS idx_bank_cards_user ON bank_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_cards_account ON bank_cards(account_id);

CREATE TABLE IF NOT EXISTS bank_ebill_emitters (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  creditor_iban TEXT NOT NULL,
  creditor_bic TEXT,
  creditor_name TEXT NOT NULL,
  creditor_country TEXT NOT NULL,
  creditor_postal_code TEXT NOT NULL,
  creditor_city TEXT NOT NULL,
  creditor_address1 TEXT NOT NULL,
  creditor_address2 TEXT,
  rf_reference TEXT,
  communication_to_beneficiary TEXT
);

CREATE TABLE IF NOT EXISTS bank_user_ebill_emitters (
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  emitter_id INTEGER NOT NULL REFERENCES bank_ebill_emitters(id) ON DELETE CASCADE,
  accepted_at TEXT,
  blocked_at TEXT,
  PRIMARY KEY (user_id, emitter_id)
);

CREATE TABLE IF NOT EXISTS bank_ebills (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bank_users(id) ON DELETE CASCADE,
  emitter_id INTEGER NOT NULL REFERENCES bank_ebill_emitters(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  due_date TEXT,
  reference_text TEXT,
  accounting_text TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'paid')),
  paid_transaction_id INTEGER REFERENCES bank_transactions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'))
);

CREATE INDEX IF NOT EXISTS idx_bank_ebills_user ON bank_ebills(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_ebills_user_emitter ON bank_ebills(user_id, emitter_id);
CREATE INDEX IF NOT EXISTS idx_bank_user_ebill_emitters_user ON bank_user_ebill_emitters(user_id);
