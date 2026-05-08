# Relais Bank

Educational online-banking simulation built with [Next.js](https://nextjs.org). Available in English and French. **No real payment or transfer is ever executed** — every action is recorded in a local SQLite ledger for demonstration purposes only.

## Features

- Wealth overview grouped by account category (checking, savings, retirement, cards)
- Account detail pages with upcoming and past transactions
- Make-payment flow (one-time and standing orders, including Swiss QR-bill scanning)
- Make-transfer flow between your own accounts
- Read-only transaction detail pages with print support
- Demo ledger backed by SQLite, auto-seeded on first boot

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app. The local SQLite database is created and seeded automatically the first time the server starts (see `lib/db/`). Visit `/reset` at any time to wipe and re-seed it.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Project layout

- `app/` — Next.js App Router pages and server actions
- `components/` — atoms / molecules / organisms (shared UI + bank-specific)
- `lib/` — bank domain logic, SQLite client, i18n
- `locales/` — `en` and `fr` translation files
- `public/` — static assets (e.g. QR-scanner worker)

## Repository

[github.com/soleilvermeil/relais-bank](https://github.com/soleilvermeil/relais-bank)
