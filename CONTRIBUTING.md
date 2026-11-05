# Contributing to SimpleBooks

Thanks for helping out. This project is a small T3 stack app, so the rules are
deliberately short: keep changes scoped, keep the three branches in sync, and
run the checks before opening a pull request.

## Branch model

| Branch | Purpose |
|---|---|
| `dev` | Active development. All feature work lands here first. |
| `staging` | Release candidate. `dev` is fast-forwarded into it for testing. |
| `main` | Production. `dev` is merged into it when a release is ready. |

Workflow:

1. Branch off `dev` (`feat/...`, `fix/...`, `chore/...`).
2. Commit there, open a PR into `dev`, and merge once CI and review pass.
3. To release: fast-forward `staging` from `dev`, verify, then merge `dev` into
   `main` and push. Afterwards fast-forward `dev` and `staging` to the merge
   commit so all three point at the same tree.

Don't commit directly to `main`. Don't force-push shared branches.

## Setup

```bash
npm install
cp .env.example .env    # fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate
npm run dev
```

See [README.md](./README.md) for the full environment and script reference.

## Before opening a pull request

Run all four and make sure they pass:

```bash
npx tsc --noEmit     # or: npm run typecheck
npm run lint
npm run test
npm run build
```

If a check fails, fix the cause — don't weaken an assertion or silence a rule
just to get a green run.

Kill any running dev server before `npm run build`; it can hold `.next` and
produce a confusing failure.

## Commit messages

`type(scope): summary` in the imperative mood, lower-case summary, no trailing
period. One logical change per commit.

```
feat(invoices): mark invoices as paid from the list, with bulk actions
fix(overview): count outstanding invoices in the Outstanding note
chore(test): drop unused declarations so lint is warning-free
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

## Code conventions

- TypeScript strict; no `any` unless there is no alternative and it is commented.
- Server code lives in `src/server/api/routers/*`. Every procedure is a
  `protectedProcedure` and filters by `ctx.userId`.
- Validate input with Zod; don't trust client-supplied totals — recompute
  invoice totals server-side.
- Prefer the shared CRUD factory (`src/server/api/crud.ts`) over copy-pasted
  list/create/update/delete procedures.
- Components live in `src/components`, routes in `src/app`. Match the existing
  file naming (`camelCase.tsx` for components, `page.tsx` for routes).
- Tailwind classes come from the project tokens (`text-fg-secondary`,
  `border-border-subtle`, …) rather than raw hex or ad-hoc greys. Shared button
  styles are in `src/components/buttonStyles.ts`.

### Formatting: read this first

The codebase is **hand-formatted with 4-space indentation**. `prettier.config.js`
does not override `tabWidth` (Prettier defaults to 2), so `npm run format:write`
would rewrite every file. Don't run the formatter across the repo, and don't
reformat files you aren't otherwise changing. Match the indentation and style of
the file you're editing.

## Database changes

- Edit `prisma/schema.prisma`, then create a migration with
  `npx prisma migrate dev --name <description>`.
- Commit both the schema change and the generated `prisma/migrations/<timestamp>_<name>/`
  directory.
- Migrations must be applied in deployed environments with `npm run db:migrate`
  **before** the app serves requests.
- Never edit a migration that has already been applied to a shared environment;
  add a new one.

## Tests

Tests are Vitest, run with `npm run test`, and live next to the code as
`*.test.ts` (`src/server/api/crud.test.ts`, `src/lib/authValidation.test.ts`).

- Cover the behaviour you changed, especially server-side invariants
  (ownership checks, total recomputation, status transitions).
- Prefer testing pure helpers and routers over rendering full pages.
- A bug fix should come with a test that fails before the fix.

There is no end-to-end test suite yet; if you add one, wire it into
`npm run test` or a clearly documented separate script.

## Pull requests

Keep the description short and concrete:

- what changed and why,
- how you verified it (the commands you ran and their result),
- any migration or environment change the reviewer must apply.

Don't commit secrets, `.env` files, or build output. Don't bypass hooks with
`--no-verify`.
