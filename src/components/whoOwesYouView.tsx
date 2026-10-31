"use client";

import { useState } from "react";
import { CheckCircle2, Download, Info, Plus } from "lucide-react";
import { StatCard } from "./statCard";
import { BalancesTable } from "./balancesTable";
import { AgingBuckets } from "./agingBuckets";
import { BalanceSummary } from "./balanceSummary";
import { ReminderComposer, type ReminderInput } from "./reminderComposer";
import { RecordPaymentForm, type PaymentInput } from "./recordPaymentForm";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { usd } from "~/lib/format";
import { toDateInput } from "~/lib/expenseDraft";
import { sumAmounts } from "~/lib/expenseSummary";
import {
    clientCount,
    outstandingBalances,
    plural,
    sortBalances,
    sumBalances,
} from "~/lib/receivables";
import type { Invoice } from "~/lib/sampleInvoices";
import type { Expense } from "~/lib/sampleExpenses";
import type { ClientOption, PaymentMethod } from "~/lib/sampleBilling";

type Panel = { kind: "reminder"; invoiceId: string } | { kind: "payment"; invoiceId: string | null } | null;

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

type WhoOwesYouViewProps = {
    initialInvoices: Invoice[];
    expenses: Expense[];
    clients: ClientOption[];
    paymentMethods: PaymentMethod[];
    reminderHistory: Record<string, Date>;
    sender: string;
    today: Date;
};

export function WhoOwesYouView({
    initialInvoices,
    expenses,
    clients,
    paymentMethods,
    reminderHistory,
    sender,
    today,
}: WhoOwesYouViewProps) {
    // Local state stands in for the database until the routers land
    const [invoices, setInvoices] = useState(initialInvoices);
    const [lastReminders, setLastReminders] = useState(reminderHistory);
    const [notice, setNotice] = useState<string | null>(null);

    const balances = outstandingBalances(invoices, today);
    const overdue = balances.filter((b) => b.overdue);
    const notYetDue = balances.filter((b) => !b.overdue);
    const unpaidBills = expenses.filter((e) => e.status === "UNPAID");

    // Open on the oldest overdue invoice, like the design
    const [panel, setPanel] = useState<Panel>(() => {
        const oldest = sortBalances(overdue, "oldest")[0];
        return oldest ? { kind: "reminder", invoiceId: oldest.invoice.id } : null;
    });

    const reminderBalance = panel?.kind === "reminder" ? balances.find((b) => b.invoice.id === panel.invoiceId) : undefined;
    const oldestOverdue = Math.max(0, ...overdue.map((b) => b.daysOverdue));
    const furthestDue = Math.max(0, ...notYetDue.map((b) => b.daysUntilDue));
    const showPanel = panel?.kind === "payment" || reminderBalance !== undefined;

    function handleSendReminder(input: ReminderInput) {
        // TODO: api.invoice.sendReminder.mutate(input) once there's an email/reminder router
        console.info("Reminder ready to send", input);
        setLastReminders((prev) => ({ ...prev, [input.invoiceId]: today }));
        setNotice(`Reminder sent to ${input.to}.`);
    }

    function handleRecordPayment(input: PaymentInput) {
        const invoice = invoices.find((inv) => inv.id === input.invoiceId);
        setInvoices((prev) =>
            prev.map((inv) => (inv.id === input.invoiceId ? { ...inv, status: "PAID", paidAt: input.paidAt } : inv)),
        );
        setPanel(null);
        if (invoice) setNotice(`${invoice.client.name} paid ${invoice.number} · ${usd.format(input.amount)}. Marked as paid.`);
    }

    function handleExport() {
        const header = ["Client", "Invoice", "Project", "Issued", "Due date", "Status", "Days overdue", "Balance"];
        const rows = sortBalances(balances, "oldest").map((b) => [
            b.invoice.client.name,
            b.invoice.number,
            b.invoice.projectTitle,
            toDateInput(b.invoice.issueDate),
            toDateInput(b.invoice.dueDate),
            b.overdue ? "OVERDUE" : "SENT",
            String(b.daysOverdue),
            b.amount.toFixed(2),
        ]);
        const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `balances-${toDateInput(today)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-overline uppercase text-fg-tertiary">A clearer path to getting paid</p>
                    <h1 className="mt-2 text-display-page">Who owes you</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        Good client relationships. Healthy cash flow. Keep both in view.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={handleExport} className={secondaryButton}>
                        <Download className="size-4" /> Export balances
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setPanel({ kind: "payment", invoiceId: reminderBalance?.invoice.id ?? null });
                            setNotice(null);
                        }}
                        className={primaryButton}
                    >
                        <Plus className="size-4" /> Record payment
                    </button>
                </div>
            </div>

            {notice && (
                <div role="status" className="flex items-start gap-3 rounded-lg border border-border-default bg-accent-soft p-4 text-body-m text-fg-primary">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fg-accent" />
                    <p>
                        {notice}{" "}
                        <span className="text-fg-secondary">(Sample mode: nothing is saved or emailed until the invoice router is connected.)</span>
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                <StatCard
                    label="Total owed to you"
                    value={sumBalances(balances)}
                    note={`${plural(clientCount(balances), "client")} · ${plural(balances.length, "outstanding invoice")}`}
                    highlight
                />
                <StatCard
                    label="Overdue"
                    value={sumBalances(overdue)}
                    note={
                        overdue.length > 0
                            ? `${plural(clientCount(overdue), "client")} · oldest invoice is ${plural(oldestOverdue, "day")} late`
                            : "Nothing overdue. Everyone’s on time."
                    }
                    overdue={overdue.length > 0}
                />
                <StatCard
                    label="Not yet due"
                    value={sumBalances(notYetDue)}
                    note={
                        notYetDue.length > 0
                            ? `${plural(notYetDue.length, "invoice")} due in the next ${plural(furthestDue, "day")}`
                            : "No invoices waiting on a due date"
                    }
                />
            </div>

            <div className="grid grid-cols-12 items-start gap-6">
                <div className={`flex flex-col gap-6 ${showPanel ? "col-span-8" : "col-span-12"}`}>
                    <BalancesTable
                        balances={balances}
                        selectedId={reminderBalance?.invoice.id ?? null}
                        onRemind={(invoiceId) => {
                            setPanel({ kind: "reminder", invoiceId });
                            setNotice(null);
                        }}
                    />
                    <AgingBuckets balances={balances} today={today} />
                    <BalanceSummary
                        pendingIncome={sumBalances(balances)}
                        invoiceCount={balances.length}
                        unpaidBills={sumAmounts(unpaidBills)}
                        billCount={unpaidBills.length}
                    />
                </div>

                {showPanel && (
                    <div className="sticky top-8 col-span-4">
                        {panel?.kind === "payment" ? (
                            <RecordPaymentForm
                                balances={sortBalances(balances, "oldest")}
                                initialInvoiceId={panel.invoiceId}
                                paymentMethods={paymentMethods}
                                today={today}
                                onSave={handleRecordPayment}
                                onClose={() => setPanel(null)}
                            />
                        ) : (
                            reminderBalance && (
                                <ReminderComposer
                                    key={reminderBalance.invoice.id}
                                    balance={reminderBalance}
                                    contact={clients.find((c) => c.name === reminderBalance.invoice.client.name)}
                                    sender={sender}
                                    lastSentAt={lastReminders[reminderBalance.invoice.id] ?? null}
                                    onSend={handleSendReminder}
                                    onClose={() => setPanel(null)}
                                />
                            )
                        )}
                    </div>
                )}
            </div>

            <p className="flex items-center gap-2 text-body-s text-fg-tertiary">
                <Info className="size-4" />
                Balances include sent and overdue invoices. Unpaid bills are expenses marked unpaid, from any month.
            </p>
        </div>
    );
}