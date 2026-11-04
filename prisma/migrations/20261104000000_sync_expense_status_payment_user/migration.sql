-- Brings the migrations in line with schema.prisma (these were only ever applied with `db push`).

-- Expense: PAID / UNPAID status
CREATE TYPE "ExpenseStatus" AS ENUM ('PAID', 'UNPAID', 'PENDING', 'OVERDUE', 'CANCELLED');
ALTER TABLE "Expense" ADD COLUMN "status" "ExpenseStatus" NOT NULL DEFAULT 'PAID';

-- Expense: every expense has a vendor
DROP INDEX IF EXISTS "Expense_vendorId_idx";
ALTER TABLE "Expense" ALTER COLUMN "vendorId" SET NOT NULL;

-- Invoice: number has no default
ALTER TABLE "Invoice" ALTER COLUMN "number" DROP DEFAULT;

-- InvoiceItem: search index
CREATE INDEX "InvoiceItem_description_idx" ON "InvoiceItem"("description");

-- Payment: owner, copied from the invoice for any existing rows
ALTER TABLE "Payment" ADD COLUMN "userId" TEXT;
UPDATE "Payment" p SET "userId" = i."userId" FROM "Invoice" i WHERE p."invoiceId" = i."id";
ALTER TABLE "Payment" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");