"use client";

import { useState } from "react";
import { CheckCircle2, Info, Plus } from "lucide-react";
import { StatCard } from "~/components/statCard";
import { SkeletonCard, SkeletonRows } from "~/components/skeleton";
import { BalancesTable } from "~/components/balancesTable";
import { BalanceSummary } from "~/components/balanceSummary";
import { RecordPaymentForm, type PaymentInput } from "~/components/recordPaymentForm";
import { primaryButton } from "~/components/buttonStyles";
import { formatMoney } from "~/lib/format";
import { useWorkspaceCurrency } from "~/lib/useWorkspaceCurrency";
import { sumAmounts } from "~/lib/expenseSummary";
import {
    clientCount,
    outstandingBalances,
    plural,
    sortBalances,
    sumBalances,
} from "~/lib/receivables";
import type { Invoice } from "~/lib/sampleInvoices";
import { api } from "~/trpc/react";

export default function WhoOwesYouPage() {
    const currency = useWorkspaceCurrency();
    const [today] = useState(() => new Date());
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const utils = api.useUtils();
    const invoiceList = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet
    const billList = api.expenses.list.useQuery({ status: "UNPAID", take: 100 });
    const createPayment = api.invoices.createPayment.useMutation();

    const pending = invoiceList.isPending || billList.isPending;
    const rows = invoiceList.data?.invoices ?? [];
    const unpaidBills = billList.data?.expenses ?? [];
    // Reshape the router rows into the Invoice type the table and form already use
    const invoices: Invoice[] = rows.map((inv) => ({
        id: inv.id,
        number: inv.number,
        client: inv.client,
        projectTitle: inv.projectTitle ?? "",
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        currency: inv.currency,
        total: inv.balance, // what is still owed after partial payments
        paidAt: inv.paidAt,
    }));

    const balances = outstandingBalances(invoices, today);
    const overdue = balances.filter((b) => b.overdue);
    const notYetDue = balances.filter((b) => !b.overdue);
    const oldestOverdue = Math.max(0, ...overdue.map((b) => b.daysOverdue));
    const furthestDue = Math.max(0, ...notYetDue.map((b) => b.daysUntilDue));

    async function handleRecordPayment(input: PaymentInput) {
        setError(null);
        const invoice = invoices.find((inv) => inv.id === input.invoiceId);
        try {
            // A full payment, so the router marks the invoice PAID and it drops off this page
            await createPayment.mutateAsync({ invoiceId: input.invoiceId, amount: input.amount, date: input.paidAt });
            await utils.invoices.list.invalidate();
            setPaymentOpen(false);
            if (invoice) setNotice(`${invoice.client.name} paid ${invoice.number} · ${formatMoney(input.amount, invoice.currency)}. Marked as paid.`);
        } catch {
            setError("Couldn’t record that payment. Please try again.");
        }
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
                <button
                    type="button"
                    onClick={() => {
                        setPaymentOpen(true);
                        setNotice(null);
                        setError(null);
                    }}
                    className={`${primaryButton} shrink-0`}
                >
                    <Plus className="size-4" /> Record payment
                </button>
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
                {pending ? (
                    <>
                        <SkeletonCard className="h-32" />
                        <SkeletonCard className="h-32" />
                        <SkeletonCard className="h-32" />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total owed to you"
                            value={sumBalances(balances)}
                            currency={currency}
                            note={`${plural(clientCount(balances), "client")} · ${plural(balances.length, "outstanding invoice")}`}
                            gradient
                        />
                        <StatCard
                            label="Overdue"
                            value={sumBalances(overdue)}
                            currency={currency}
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
                            currency={currency}
                            note={
                                notYetDue.length > 0
                                    ? `${plural(notYetDue.length, "invoice")} due in the next ${plural(furthestDue, "day")}`
                                    : "No invoices waiting on a due date"
                            }
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-12 items-start gap-6">
                <div className={`flex flex-col gap-6 ${paymentOpen ? "col-span-8" : "col-span-12"}`}>
                    {pending ? (
                        <div className="rounded-lg border border-border-default bg-surface p-6 shadow-card-elevated">
                            <SkeletonRows rows={6} />
                        </div>
                    ) : (
                        <>
                            <BalancesTable balances={balances} currency={currency} />
                            <BalanceSummary
                                pendingIncome={sumBalances(balances)}
                                invoiceCount={balances.length}
                                unpaidBills={sumAmounts(unpaidBills)}
                                billCount={unpaidBills.length}
                                currency={currency}
                            />
                        </>
                    )}
                </div>

                {paymentOpen && (
                    <div className="sticky top-8 col-span-4">
                        <RecordPaymentForm
                            balances={sortBalances(balances, "oldest")}
                            initialInvoiceId={null}
                            today={today}
                            onSave={handleRecordPayment}
                            onClose={() => setPaymentOpen(false)}
                        />
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