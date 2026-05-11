-- Run once against an existing database that already had `users` rows before `user_profiles` existed.
-- Without a row here, legacy users (session cookie but no profile) are sent to /onboarding until they submit or you backfill.
-- Skips users who already have a profile row.

INSERT INTO user_profiles (user_id, first_name, last_name, email)
SELECT id, 'Demo', 'User', 'legacy+' || id::text || '@demo.invalid'
FROM users
WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.user_id = users.id);
