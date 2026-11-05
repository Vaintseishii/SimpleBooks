# SimpleBooks

A lightweight accounting app for small business owners and freelancers. Issue invoices, record expenses, see who owes you, and watch a simple Profit & Loss — without bookkeeping software.

Built on the [T3 stack](https://create.t3.gg/): Next.js App Router, TypeScript, tRPC, Prisma, Auth.js and Tailwind CSS.

## Team

- Joseph Brian Azarraga
- Sherwin Sid Sañol
- Xanth Reign Palmes

## Features

### Invoicing (money in)

- Create invoices with line items (description, quantity, unit price), discount, tax rate, issue and due dates.
- Edit an existing invoice — status is preserved, line items are replaced and totals are recalculated.
- Invoice status: `DRAFT` → `SENT` → `PAID`. Overdue is derived, not stored: a `SENT` invoice becomes overdue after its due date.
- Record partial payments; an invoice flips to `PAID` automatically once payments cover the total.
- Mark one or many invoices paid in full from the list, and delete one or many invoices.
- Print view at `/invoices/[id]/print` with a "Save as PDF" button (browser print dialog).
- Invoice numbers are generated per user and compared numerically, so `INV-10000` follows `INV-9999`.

### Expenses (money out)

- Record expenses with vendor, description, amount, date, category (`TRAVEL`, `WORKSPACE`, `SUPPLIES`, `SOFTWARE`, `RENT`), optional receipt URL and notes.
- Payment status: `PAID` or `UNPAID` (bill); also modelled: `PENDING`, `OVERDUE`, `CANCELLED`.
- Create a vendor inline while recording an expense; delete and mark bills paid from the list.
- Category breakdown shown as a stacked bar with per-category totals and shares.

### Receivables

- `/who-owes-you` aggregates unpaid invoices and unpaid bills: outstanding totals, aging buckets, per-client balances and a record-payment form.

### Reports

- Profit & Loss over **this month** or **year to date**: revenue from paid invoices, expenses from paid bills, net profit and margin.
- Overview dashboard with money in/out, net income and outstanding.
- All aggregates are reported in the workspace currency; individual records keep their own stored currency.

### Workspace and account

- One currency per workspace, chosen in `/profile`; applies to every new invoice and expense.
- Edit first and last name; the session updates without signing out.
- Sign up / sign in with email and password (bcrypt hashes, Auth.js credentials provider). Route protection via middleware.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack in dev) |
| Language | TypeScript 5, strict |
| API | tRPC v11 + TanStack React Query |
| Database | PostgreSQL + Prisma 6 |
| Auth | Auth.js (NextAuth v5), credentials + bcrypt |
| Styling | Tailwind CSS v4, Lucide icons |
| Validation | Zod 4 |
| Tests | Vitest |

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or hosted)

### 1. Install

```bash
npm install
```

`postinstall` runs `prisma generate`.

### 2. Configure environment

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | Auth.js session encryption (`npx auth secret`) |

The optional `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` variables are declared in `src/env.js` but no OAuth provider is enabled yet.

### 3. Create the database

```bash
npm run db:migrate   # prisma migrate deploy — applies prisma/migrations
npm run db:studio    # optional: browse data
```

On a brand-new database `npx prisma migrate dev` also works and will generate the client.

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` / `npm start` | Production build and server |
| `npm run preview` | Build then start |
| `npm run lint` / `lint:fix` | ESLint (Next core-web-vitals + typed TS rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | Lint + typecheck |
| `npm run test` | Vitest (unit tests for the CRUD factory, validation helpers) |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:generate` | `prisma migrate dev` — create/apply a migration in development |
| `npm run db:push` | Push the schema without a migration (prototyping only) |
| `npm run db:studio` | Prisma Studio |
| `npm run format:check` / `format:write` | Prettier + Tailwind class sorting |

> **Formatting note:** the codebase is hand-formatted with **4-space indentation**. `prettier.config.js` has no `tabWidth` override, so `format:write` would reformat the whole repo. Prefer editing to match the surrounding file, and don't run the formatter on unrelated files.

## Project structure

```
prisma/
  schema.prisma          # User, Workspace, Client, Invoice, InvoiceItem,
                         # Expense, Vendor, Payment, Auth.js models
  migrations/            # 7 migrations, applied with db:migrate
src/
  app/                   # App Router routes
    page.tsx             # overview dashboard
    invoices/            # list, new, [id], [id]/edit, [id]/print
    clients/  expenses/  who-owes-you/  profile/  vendors/  auth/
  components/            # UI: tables, forms, sidebar, skeletons, stats
  lib/                   # currency, formatting, invoice status, validation
  server/
    api/
      crud.ts            # reusable CRUD factory (list/create/update/delete hooks)
      routers/           # invoice, expense, client, vendor, report, workspace, user
      trpc.ts            # context + protectedProcedure
  auth.ts                # Auth.js config (credentials)
  env.js                 # validated environment variables
  middleware.ts          # route protection
```

## Data model notes

- Every record is scoped by `userId`; every procedure is `protectedProcedure` and filters by the caller.
- `Invoice.clientId` is `onDelete: Restrict` — deleting a client with invoices is refused with a clear message.
- `InvoiceItem` and `Payment` cascade with their invoice.
- Invoice totals (`subtotal`, `discount`, `tax`, `total`) are recomputed server-side from line items on create/update, never trusted from the client.
- `balance` is derived (`total` − sum of payments), not stored.

## Deployment

No platform config is committed. To deploy (Vercel + hosted Postgres):

1. Provision PostgreSQL and set `DATABASE_URL` and `AUTH_SECRET` in the host's environment.
2. Apply migrations **before** the first request:
   ```bash
   npm run db:migrate
   ```
3. Deploy with the default Next.js build (`npm run build`).

Running migrations matters: `20261103000000_split_user_name` replaces `User.name` with `firstName`/`lastName`, and `20261105000000_single_currency` backfills invoice and expense currencies. Without them, sign-in and invoice pages fail.

## Known limitations

- No optimistic UI; mutations invalidate and refetch.
- "Save as PDF" is the browser's print dialog — there is no generated/emailed PDF.
- Category breakdown is a stacked bar, not a pie chart (`recharts` is not installed); `reports.categoryBreakdown` and `reports.cashFlow` exist but the UI does not call them.
- `/vendors` is a placeholder page; vendors are managed inline from the expense form.
- No password reset and no invoice delivery by email.
- No FX conversion — one currency per workspace, no cross-currency totals.
- The client-side duplicate-invoice-number check only looks at the most recent 100 invoices (the server still rejects duplicates).
- bcrypt truncates passwords at 72 **bytes**, while validation counts 72 characters.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch model, commit style and the checks expected before a pull request.
