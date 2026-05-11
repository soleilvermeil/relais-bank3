-- One-time cleanup after renaming tables to bank_*.
-- Run once in Neon SQL Editor or psql against the same DATABASE_URL if unprefixed tables still exist.
-- Safe to re-run: each statement uses IF EXISTS.

DROP TABLE IF EXISTS ebills;
DROP TABLE IF EXISTS user_ebill_emitters;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS standing_orders;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS ebill_emitters;
DROP TABLE IF EXISTS users;

-- After profile merge: remove standalone profile table if it still exists on older branches.
DROP TABLE IF EXISTS bank_user_profiles;
