import type { Expense, ExpenseCategory, ExpenseStatus, Vendor } from "./sampleExpenses";

// What the Record expense form holds while you type (strings, like the inputs)
export type ExpenseDraft = {
    vendorName: string;
    description: string;
    amount: string;
    date: string; // YYYY-MM-DD from the date input
    category: ExpenseCategory;
    status: ExpenseStatus;
    paidWith: string;
    notes: string;
    receipt: { name: string; size: number } | null;
};

export type ExpenseDraftErrors = Partial<Record<"vendorName" | "description" | "amount" | "date", string>>;

// What we'd send to the expense router. A new vendor is created first when vendorId is null.
export type ExpenseInput = {
    vendorId: string | null;
    newVendorName: string | null;
    description: string;
    amount: number;
    date: Date;
    category: ExpenseCategory;
    status: ExpenseStatus;
    paidWith: string | null;
    notes: string | null;
    receiptUrl: string | null;
};

export const toDateInput = (date: Date) => date.toLocaleDateString("en-CA"); // YYYY-MM-DD

export function fromDateInput(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

// "$1,284.50" -> 1284.5, anything else -> NaN
export function parseAmount(value: string) {
    const cleaned = value.replace(/[$,\s]/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return Number.NaN;
    return Math.round(Number(cleaned) * 100) / 100;
}

export const findVendor = (vendors: Vendor[], name: string) =>
    vendors.find((v) => v.name.toLowerCase() === name.trim().toLowerCase());

export function createExpenseDraft(today: Date, paidWith: string): ExpenseDraft {
    return {
        vendorName: "",
        description: "",
        amount: "",
        date: toDateInput(today),
        category: "SOFTWARE",
        status: "PAID",
        paidWith,
        notes: "",
        receipt: null,
    };
}

export function validateExpenseDraft(draft: ExpenseDraft): ExpenseDraftErrors {
    const errors: ExpenseDraftErrors = {};
    if (!draft.vendorName.trim()) errors.vendorName = "Who did you pay? Pick a vendor or type a new one.";
    if (!draft.description.trim()) errors.description = "Add a short description so you remember what it was for.";

    const amount = parseAmount(draft.amount);
    if (Number.isNaN(amount)) errors.amount = "Enter an amount like 29.00.";
    else if (amount <= 0) errors.amount = "The amount has to be more than $0.";

    if (!fromDateInput(draft.date)) errors.date = "Pick the date of the expense.";
    return errors;
}

// Call only after validateExpenseDraft found no errors
export function toExpenseInput(draft: ExpenseDraft, vendors: Vendor[]): ExpenseInput {
    const existing = findVendor(vendors, draft.vendorName);
    return {
        vendorId: existing?.id ?? null,
        newVendorName: existing ? null : draft.vendorName.trim(),
        description: draft.description.trim(),
        amount: parseAmount(draft.amount),
        date: fromDateInput(draft.date) ?? new Date(),
        category: draft.category,
        status: draft.status,
        paidWith: draft.status === "PAID" ? draft.paidWith : null,
        notes: draft.notes.trim() || null,
        // TODO: upload the file and store its URL once receipt storage exists
        receiptUrl: draft.receipt?.name ?? null,
    };
}

// Sample mode only: turns the input into a row for the list, so you can see it appear
export function toSampleExpense(input: ExpenseInput, vendors: Vendor[]): Expense {
    const { vendorId, newVendorName, ...fields } = input;
    const vendor = vendors.find((v) => v.id === vendorId) ?? { id: `new-${Date.now()}`, name: newVendorName ?? "New vendor" };
    return { id: `e-${Date.now()}`, vendor, ...fields };
}