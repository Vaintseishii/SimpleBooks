-- Add RENT to ExpenseCategory enum
BEGIN;
CREATE TYPE "ExpenseCategory_new" AS ENUM ('TRAVEL', 'WORKSPACE', 'SUPPLIES', 'SOFTWARE', 'RENT');
ALTER TABLE "public"."Expense" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Expense" ALTER COLUMN "category" TYPE "ExpenseCategory_new" USING ("category"::text::"ExpenseCategory_new");
ALTER TYPE "ExpenseCategory" RENAME TO "ExpenseCategory_old";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
DROP TYPE "public"."ExpenseCategory_old";
ALTER TABLE "Expense" ALTER COLUMN "category" SET DEFAULT 'SOFTWARE';
COMMIT;

-- Create Vendor table
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- Add vendorId back to Expense table
ALTER TABLE "Expense" ADD COLUMN "vendorId" TEXT;

-- Add foreign key from Expense to Vendor
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key from Vendor to User
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for Vendor
CREATE INDEX "Vendor_userId_idx" ON "Vendor"("userId");
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");

-- Create index for Expense vendorId
CREATE INDEX "Expense_vendorId_idx" ON "Expense"("vendorId");