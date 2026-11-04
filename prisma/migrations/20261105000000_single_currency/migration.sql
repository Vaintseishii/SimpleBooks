-- One currency per workspace: the profile setting is now the only currency,
-- so existing invoices and expenses follow it instead of holding a stale code.
-- Idempotent: no DDL, safe to re-run.
UPDATE "Invoice" i
SET "currency" = w."currency"
FROM "Workspace" w
WHERE w."userId" = i."userId";

UPDATE "Expense" e
SET "currency" = w."currency"
FROM "Workspace" w
WHERE w."userId" = e."userId";
