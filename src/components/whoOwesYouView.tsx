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
import type { PaymentMethod } from "~/lib/sampleBilling";
import { api } from "~/trpc/react";

type Panel = { kind: "reminder"; invoiceId: string } | { kind: "payment"; invoiceId: string | null } | null;

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

type WhoOwesYouViewProps = {
    paymentMethods: PaymentMethod[];
    sender: string;
};

export function WhoOwesYouView({ paymentMethods, sender }: WhoOwesYouViewProps) {
    const [today] = useState(() => new Date());
    const [lastReminders, setLastReminders] = useState<Record<string, Date>>({}); // reminders sent on this visit
    const [notice, setNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const utils = api.useUtils();
    const invoiceList = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet
    const billList = api.expenses.list.useQuery({ status: "UNPAID", take: 100 });
    const clientList = api.clients.list.useQuery({ take: 100 });
    const createPayment = api.invoices.createPayment.useMutation();

    const rows = invoiceList.data?.invoices ?? [];
    const clients = clientList.data ?? [];
    const unpaidBills = billList.data?.expenses ?? [];
    // Reshape the router rows into the Invoice type the table, buckets and forms already use
    const invoices: Invoice[] = rows.map((inv) => ({
        id: inv.id,
        number: inv.number,
        client: inv.client,
        projectTitle: inv.projectTitle ?? "",
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        total: inv.total,
        paidAt: inv.paidAt,
    }));

    const balances = outstandingBalances(invoices, today);
    const overdue = balances.filter((b) => b.overdue);
    const notYetDue = balances.filter((b) => !b.overdue);

    // Until you pick something, open on the oldest overdue invoice, like the design.
    // undefined = not picked yet (the data loads after the first render).
    const [pickedPanel, setPanel] = useState<Panel | undefined>(undefined);
    const oldest = sortBalances(overdue, "oldest")[0];
    const panel: Panel =
        pickedPanel !== undefined ? pickedPanel : oldest ? { kind: "reminder", invoiceId: oldest.invoice.id } : null;

    const reminderBalance = panel?.kind === "reminder" ? balances.find((b) => b.invoice.id === panel.invoiceId) : undefined;
    const oldestOverdue = Math.max(0, ...overdue.map((b) => b.daysOverdue));
    const furthestDue = Math.max(0, ...notYetDue.map((b) => b.daysUntilDue));
    const showPanel = panel?.kind === "payment" || reminderBalance !== undefined;

    function handleSendReminder(input: ReminderInput) {
        // TODO: api.invoice.sendReminder.mutate(input) once there's an email/reminder router
        console.info("Reminder ready to send", input);
        setLastReminders((prev) => ({ ...prev, [input.invoiceId]: today }));
        setNotice(`Reminder ready for ${input.to}. (Reminders aren’t emailed yet.)`);
    }

    async function handleRecordPayment(input: PaymentInput) {
        setError(null);
        const invoice = invoices.find((inv) => inv.id === input.invoiceId);
        try {
            // A full payment, so the router marks the invoice PAID and it drops off this page
            await createPayment.mutateAsync({ invoiceId: input.invoiceId, amount: input.amount, date: input.paidAt });
            await utils.invoices.list.invalidate();
            setPanel(null);
            if (invoice) setNotice(`${invoice.client.name} paid ${invoice.number} · ${usd.format(input.amount)}. Marked as paid.`);
        } catch {
            setError("Couldn’t record that payment. Please try again.");
        }
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
                            setError(null);
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
                    <p>{notice}</p>
                </div>
            )}

            {error && (
                <p role="alert" className="rounded-lg bg-status-overdue p-4 text-body-m text-status-overdue-fg">
                    {error}
                </p>
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
                                    lastSentAt={
                                        lastReminders[reminderBalance.invoice.id] ??
                                        rows.find((r) => r.id === reminderBalance.invoice.id)?.lastReminderAt ??
                                        null
                                    }
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

