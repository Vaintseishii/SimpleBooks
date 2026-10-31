import NextLink from "next/link";
import { Info, Plus } from "lucide-react";
import { StatCard } from "~/components/statCard";
import { InvoicesTable } from "~/components/invoicesTable";
import { ExportButton } from "~/components/exportButton";
import { primaryButton } from "~/components/buttonStyles";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";
import { getDisplayStatus, sameMonth } from "~/lib/invoiceStatus";

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export default function InvoicesPage() {
    const today = sampleToday;
    const invoices = sampleInvoices;

    const sent = invoices.filter((inv) => inv.status === "SENT");
    const overdue = sent.filter((inv) => getDisplayStatus(inv, today) === "overdue");
    const paidThisMonth = invoices.filter((inv) => inv.paidAt && sameMonth(inv.paidAt, today));
    const drafts = invoices.filter((inv) => inv.status === "DRAFT");
    const monthName = today.toLocaleDateString("en-US", { month: "long" });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-overline uppercase text-fg-tertiary">Billing, without the busywork</p>
                    <h1 className="mt-2 text-display-page">Invoices</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        From first draft to paid. Every invoice, in one place.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <ExportButton />
                    <NextLink href="/invoices/new" className={primaryButton}>
                        <Plus className="size-4" /> New invoice
                    </NextLink>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <StatCard
                    label="Outstanding"
                    value={sum(sent.map((inv) => inv.total))}
                    note={`${plural(sent.length, "sent invoice")} awaiting payment`}
                    highlight
                />
                <StatCard
                    label="Overdue"
                    value={sum(overdue.map((inv) => inv.total))}
                    note={`${plural(overdue.length, "invoice")} ${overdue.length === 1 ? "needs" : "need"} a follow-up`}
                    overdue={overdue.length > 0}
                />
                <StatCard
                    label="Paid this month"
                    value={sum(paidThisMonth.map((inv) => inv.total))}
                    note={`${plural(paidThisMonth.length, "payment")} received in ${monthName}`}
                />
                <StatCard
                    label="Drafts"
                    value={sum(drafts.map((inv) => inv.total))}
                    note={`${plural(drafts.length, "invoice")} ready when you are`}
                />
            </div>

            <InvoicesTable invoices={invoices} today={today} />

            <p className="flex items-center gap-2 text-body-s text-fg-tertiary">
                <Info className="size-4" />
                Outstanding includes sent and overdue invoices. Drafts aren’t included until you send them.
            </p>
        </div>
    );
}
