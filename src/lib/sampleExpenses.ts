// Expense types the page uses, shaped like the Prisma schema
// (Vendor model, Expense.vendorId, ExpenseStatus PAID/UNPAID, RENT category).

export type ExpenseCategory = "RENT" | "SOFTWARE" | "SUPPLIES" | "TRAVEL" | "WORKSPACE";

// PAID = money already left the account. UNPAID = a bill to pay later.
export type ExpenseStatus = "PAID" | "UNPAID";

export type Vendor = {
    id: string;
    name: string;
};

export type Expense = {
    id: string;
    vendor: Vendor;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: Date;
    status: ExpenseStatus;
    notes: string | null;
};