import { getDisplayStatus } from "./invoiceStatus";
import type { Invoice } from "./sampleInvoices";

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole calendar days from a to b (negative when b is earlier). UTC so daylight saving can't shift it.
export function daysBetween(a: Date, b: Date) {
    const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((end - start) / DAY_MS);
}

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const sumBalances = (balances: Pick<Balance, "amount">[]) =>
    balances.reduce((total, b) => total + b.amount, 0);

// One outstanding invoice, as the Who owes you page sees it
export type Balance = {
    invoice: Invoice;
    amount: number; // no partial payments yet, so the balance is the invoice total
    overdue: boolean;
    daysOverdue: number; // 0 when not overdue
    daysUntilDue: number; // 0 when due today or overdue
};

// Sent and not paid = money owed to you. Drafts haven't been sent, so nobody owes them yet.
export function outstandingBalances(invoices: Invoice[], today: Date): Balance[] {
    return invoices
        .filter((inv) => inv.status === "SENT")
        .map((invoice) => {
            const days = daysBetween(invoice.dueDate, today); // positive = days past due
            return {
                invoice,
                amount: invoice.total,
                overdue: getDisplayStatus(invoice, today) === "overdue",
                daysOverdue: Math.max(days, 0),
                daysUntilDue: Math.max(-days, 0),
            };
        });
}

export function dueLabel(balance: Balance) {
    if (balance.overdue) return `${plural(balance.daysOverdue, "day")} overdue`;
    if (balance.daysUntilDue === 0) return "Due today";
    return `Due in ${plural(balance.daysUntilDue, "day")}`;
}

export type SortOrder = "oldest" | "largest";

export function sortBalances(balances: Balance[], order: SortOrder) {
    return [...balances].sort((a, b) =>
        order === "largest"
            ? b.amount - a.amount
            : a.invoice.dueDate.getTime() - b.invoice.dueDate.getTime(),
    );
}

export const clientCount = (balances: Balance[]) => new Set(balances.map((b) => b.invoice.client.name)).size;