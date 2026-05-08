CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK (category IN ('checking', 'savings', 'retirement', 'cards')),
  name TEXT NOT NULL,
  identifier TEXT NOT NULL,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('payment', 'transfer', 'purchaseService', 'credit', 'debit')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
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

CREATE INDEX IF NOT EXISTS idx_transactions_debit_account ON transactions(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_account ON transactions(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_execution_date ON transactions(execution_date);
CREATE INDEX IF NOT EXISTS idx_standing_orders_debit_account ON standing_orders(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_standing_orders_start_date ON standing_orders(start_date);
