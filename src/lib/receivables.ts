import { getDisplayStatus } from "./invoiceStatus";
import { usd } from "./format";
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

// ---------- Aging: how long has it been? ----------

export type AgingBucket = {
    key: "current" | "1-30" | "31+";
    label: string;
    balances: Balance[];
    total: number;
};

export function agingBuckets(balances: Balance[]): AgingBucket[] {
    const buckets: Omit<AgingBucket, "total">[] = [
        { key: "current", label: "Not yet due", balances: balances.filter((b) => !b.overdue) },
        { key: "1-30", label: "1–30 days overdue", balances: balances.filter((b) => b.overdue && b.daysOverdue <= 30) },
        { key: "31+", label: "31+ days overdue", balances: balances.filter((b) => b.overdue && b.daysOverdue > 30) },
    ];
    return buckets.map((bucket) => ({ ...bucket, total: sumBalances(bucket.balances) }));
}

// ---------- Reminder email ----------

export const invoiceLinkToken = "[View invoice]";

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });

export function reminderTemplate(balance: Balance, contactName: string | null, sender: string) {
    const { invoice } = balance;
    const greeting = contactName ? `Hi ${contactName.split(" ")[0]},` : "Hi there,";
    const when = balance.overdue
        ? `was due on ${longDate.format(invoice.dueDate)}`
        : `is due on ${longDate.format(invoice.dueDate)}`;

    return {
        subject: `A quick reminder: invoice ${invoice.number}`,
        body: [
            greeting,
            `Just a friendly reminder that invoice ${invoice.number} for ${usd.format(balance.amount)} ${when}.`,
            "You can find your invoice and payment details at the link below.",
            invoiceLinkToken,
            "If you’ve already sent payment, thank you! Please disregard this reminder.",
            `Warmly,\n${sender}`,
        ].join("\n\n"),
    };
}