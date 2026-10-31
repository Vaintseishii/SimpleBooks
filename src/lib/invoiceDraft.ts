import type { InvoiceStatus } from "./sampleInvoices";

// ---------- Form state (strings, because that's what inputs give us) ----------

export type LineItemDraft = {
    key: string; // React key only, never saved
    description: string;
    subDescription: string;
    quantity: string;
    unitPrice: string;
};

export type InvoiceDraft = {
    clientId: string;
    number: string;
    issueDate: string; // "YYYY-MM-DD" from the date input
    dueDate: string;
    items: LineItemDraft[];
    discount: string;
    taxRate: string; // percent, e.g. "8.5"
    paymentMethod: string;
    notesToClient: string;
};

export type DraftErrors = Partial<Record<keyof InvoiceDraft, string>>;

// ---------- What gets saved: shaped like Prisma Invoice + nested InvoiceItem ----------
// When Joseph's invoice router lands, this should match its create input.

export type InvoiceInput = {
    clientId: string;
    number: string;
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    sentAt: Date | null;
    currency: string;
    subtotal: number;
    discount: number;
    taxRate: number;
    tax: number;
    total: number;
    paymentMethod: string | null;
    notesToClient: string | null;
    items: {
        description: string;
        subDescription: string | null;
        quantity: number;
        unitPrice: number;
        amount: number;
    }[];
};

// ---------- Numbers ----------

export const toNumber = (value: string) => {
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
};

// Money is Decimal(12,2) in the database, so round to cents at every step
export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const plainMoney = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const lineAmount = (item: Pick<LineItemDraft, "quantity" | "unitPrice">) =>
    roundMoney(toNumber(item.quantity) * toNumber(item.unitPrice));

export function getTotals(draft: Pick<InvoiceDraft, "items" | "discount" | "taxRate">) {
    const subtotal = roundMoney(draft.items.reduce((total, item) => total + lineAmount(item), 0));
    const discount = Math.min(roundMoney(Math.max(0, toNumber(draft.discount))), subtotal);
    const taxRate = Math.min(Math.max(0, toNumber(draft.taxRate)), 100);
    const tax = roundMoney(((subtotal - discount) * taxRate) / 100);
    const total = roundMoney(subtotal - discount + tax);
    return { subtotal, discount, taxRate, tax, total };
}

export type Totals = ReturnType<typeof getTotals>;

// ---------- Dates (local time, so Oct 14 stays Oct 14) ----------

export function toInputDate(date: Date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
}

export function fromInputDate(value: string): Date | null {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / 86_400_000);

// ---------- Builders ----------

let keyCounter = 0;

export function emptyLineItem(): LineItemDraft {
    keyCounter += 1;
    return { key: `line-${keyCounter}`, description: "", subDescription: "", quantity: "1", unitPrice: "" };
}

// INV-1052 -> INV-1053. Starts at INV-1001 when there are no invoices yet.
export function nextInvoiceNumber(existing: string[]) {
    const numbers = existing.map((n) => Number(n.replace(/\D/g, "")) || 0);
    return `INV-${Math.max(1000, ...numbers) + 1}`;
}

export const PAYMENT_TERMS_DAYS = 14; // Net 14

export function createDraft(options: { today: Date; number: string; paymentMethod: string }): InvoiceDraft {
    return {
        clientId: "",
        number: options.number,
        issueDate: toInputDate(options.today),
        dueDate: toInputDate(addDays(options.today, PAYMENT_TERMS_DAYS)),
        items: [emptyLineItem()],
        discount: "",
        taxRate: "",
        paymentMethod: options.paymentMethod,
        notesToClient: "",
    };
}

// A row counts once it has a description or an amount
export const isFilled = (item: LineItemDraft) => item.description.trim() !== "" || lineAmount(item) > 0;

// ---------- Validation ----------

export function validateDraft(draft: InvoiceDraft, existingNumbers: string[], status: InvoiceStatus): DraftErrors {
    const errors: DraftErrors = {};
    const issue = fromInputDate(draft.issueDate);
    const due = fromInputDate(draft.dueDate);
    const number = draft.number.trim().toUpperCase();

    if (!draft.clientId) errors.clientId = "Choose who this invoice is for.";
    if (!number) errors.number = "Give the invoice a number.";
    else if (existingNumbers.some((n) => n.toUpperCase() === number)) errors.number = `${number} is already used.`;
    if (!issue) errors.issueDate = "Pick an issue date.";
    if (!due) errors.dueDate = "Pick a due date.";
    else if (issue && due < issue) errors.dueDate = "Due date can’t be before the issue date.";

    // Drafts can be half-finished; a sent invoice needs real line items
    const filled = draft.items.filter(isFilled);
    if (status === "SENT") {
        if (filled.length === 0) errors.items = "Add at least one line item.";
        else if (filled.some((item) => !item.description.trim())) errors.items = "Every line item needs a description.";
        else if (filled.some((item) => toNumber(item.quantity) <= 0)) errors.items = "Quantity must be more than 0.";
        else if (getTotals(draft).total <= 0) errors.items = "The total must be more than $0.00.";
    }

    return errors;
}

export function toInvoiceInput(draft: InvoiceDraft, status: InvoiceStatus, currency: string, now: Date): InvoiceInput {
    const totals = getTotals(draft);

    return {
        clientId: draft.clientId,
        number: draft.number.trim().toUpperCase(),
        status,
        issueDate: fromInputDate(draft.issueDate) ?? now,
        dueDate: fromInputDate(draft.dueDate) ?? addDays(now, PAYMENT_TERMS_DAYS),
        sentAt: status === "SENT" ? now : null,
        currency,
        ...totals,
        paymentMethod: draft.paymentMethod || null,
        notesToClient: draft.notesToClient.trim() || null,
        items: draft.items.filter(isFilled).map((item) => ({
            description: item.description.trim(),
            subDescription: item.subDescription.trim() || null,
            quantity: toNumber(item.quantity),
            unitPrice: roundMoney(toNumber(item.unitPrice)),
            amount: lineAmount(item),
        })),
    };
}