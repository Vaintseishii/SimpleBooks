// Sample data until Joseph's expense + vendor routers land.
// Shaped like the planned Prisma schema (Vendor model, Expense.vendorId,
// ExpenseStatus PAID/UNPAID, RENT category) so the swap is easy later.

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
    receiptUrl: string | null; // null = no receipt attached yet
    paidWith: string | null; // null while the bill is unpaid
    notes: string | null;
};

// Saved as Expense.paidWith (a plain string)
export type PaymentAccount = { id: string; label: string };

export const samplePaymentAccounts: PaymentAccount[] = [
    { id: "card", label: "Business card •• 2048" },
    { id: "checking", label: "Checking •• 4821" },
    { id: "cash", label: "Cash" },
];

export const sampleVendors: Vendor[] = [
    { id: "v1", name: "Pearl Street Properties" },
    { id: "v2", name: "Scout Print Co." },
    { id: "v3", name: "Amtrak" },
    { id: "v4", name: "Adobe" },
    { id: "v5", name: "Figma" },
    { id: "v6", name: "Notion" },
    { id: "v7", name: "WeWork" },
    { id: "v8", name: "Dropbox" },
];

const vendor = (name: string): Vendor => sampleVendors.find((v) => v.name === name) ?? { id: name, name };
const day = (month: number, date: number) => new Date(2026, month - 1, date);
const card = "Business card •• 2048";
const checking = "Checking •• 4821";

export const sampleExpenses: Expense[] = [
    // October 2026
    { id: "e14", vendor: vendor("Scout Print Co."), description: "Client presentation materials", category: "SUPPLIES", amount: 192, date: day(10, 12), status: "UNPAID", receiptUrl: "scout-print-inv-311.pdf", paidWith: null, notes: "Net 30 invoice" },
    { id: "e13", vendor: vendor("Amtrak"), description: "Seattle client visit", category: "TRAVEL", amount: 550, date: day(10, 10), status: "PAID", receiptUrl: "amtrak-seattle.pdf", paidWith: card, notes: null },
    { id: "e12", vendor: vendor("Adobe"), description: "Creative Cloud subscription", category: "SOFTWARE", amount: 59, date: day(10, 8), status: "PAID", receiptUrl: "adobe-oct-2026.pdf", paidWith: card, notes: null },
    { id: "e11", vendor: vendor("Figma"), description: "Professional plan", category: "SOFTWARE", amount: 15, date: day(10, 5), status: "PAID", receiptUrl: "figma-oct-2026.pdf", paidWith: card, notes: null },
    { id: "e10", vendor: vendor("Notion"), description: "Workspace subscription", category: "SOFTWARE", amount: 18, date: day(10, 3), status: "PAID", receiptUrl: null, paidWith: card, notes: null },
    { id: "e9", vendor: vendor("WeWork"), description: "October coworking membership", category: "WORKSPACE", amount: 450, date: day(10, 1), status: "PAID", receiptUrl: "wework-oct-2026.pdf", paidWith: card, notes: null },
    { id: "e8", vendor: vendor("Pearl Street Properties"), description: "October studio rent", category: "RENT", amount: 1200, date: day(10, 1), status: "UNPAID", receiptUrl: "pearl-street-oct.pdf", paidWith: null, notes: "Due by the 15th" },
    // September 2026
    { id: "e7", vendor: vendor("Adobe"), description: "Creative Cloud subscription", category: "SOFTWARE", amount: 59, date: day(9, 8), status: "PAID", receiptUrl: "adobe-sep-2026.pdf", paidWith: card, notes: null },
    { id: "e6", vendor: vendor("Figma"), description: "Professional plan", category: "SOFTWARE", amount: 15, date: day(9, 5), status: "PAID", receiptUrl: "figma-sep-2026.pdf", paidWith: card, notes: null },
    { id: "e5", vendor: vendor("Notion"), description: "Workspace subscription", category: "SOFTWARE", amount: 18, date: day(9, 3), status: "PAID", receiptUrl: "notion-sep-2026.pdf", paidWith: card, notes: null },
    { id: "e4", vendor: vendor("Dropbox"), description: "Monthly file storage", category: "SOFTWARE", amount: 29, date: day(9, 14), status: "PAID", receiptUrl: "dropbox-sep-2026.pdf", paidWith: card, notes: null },
    { id: "e3", vendor: vendor("Scout Print Co."), description: "Business cards", category: "SUPPLIES", amount: 86, date: day(9, 18), status: "PAID", receiptUrl: "scout-print-inv-298.pdf", paidWith: checking, notes: null },
    { id: "e2", vendor: vendor("WeWork"), description: "September coworking membership", category: "WORKSPACE", amount: 450, date: day(9, 1), status: "PAID", receiptUrl: "wework-sep-2026.pdf", paidWith: card, notes: null },
    { id: "e1", vendor: vendor("Pearl Street Properties"), description: "September studio rent", category: "RENT", amount: 1200, date: day(9, 1), status: "PAID", receiptUrl: "pearl-street-sep.pdf", paidWith: checking, notes: null },
];