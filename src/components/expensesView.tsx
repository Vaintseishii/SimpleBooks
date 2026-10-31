"use client";

import { useState } from "react";
import { CheckCircle2, Download, Info, Plus } from "lucide-react";
import { StatCard } from "./statCard";
import { ExpensesTable } from "./expensesTable";
import { ExpenseForm } from "./expenseForm";
import { CategoryBreakdown } from "./categoryBreakdown";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { usd } from "~/lib/format";
import { toSampleExpense, toDateInput, type ExpenseInput } from "~/lib/expenseDraft";
import {
    categoryBreakdown,
    categoryLabels,
    inPeriod,
    monthKey,
    periodLabel,
    periodOptions,
    sumAmounts,
    type Period,
} from "~/lib/expenseSummary";
import type { Expense, PaymentAccount, Vendor } from "~/lib/sampleExpenses";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

type ExpensesViewProps = {
    initialExpenses: Expense[];
    initialVendors: Vendor[];
    paymentAccounts: PaymentAccount[];
    today: Date;
};

export function ExpensesView({ initialExpenses, initialVendors, paymentAccounts, today }: ExpensesViewProps) {
    // Local state stands in for the database until the routers land
    const [expenses, setExpenses] = useState(initialExpenses);
    const [vendors, setVendors] = useState(initialVendors);
    const [period, setPeriod] = useState<Period>(monthKey(today));
    const [formOpen, setFormOpen] = useState(false);
    const [saved, setSaved] = useState<string | null>(null);

    const isCurrentMonth = period === monthKey(today);
    const inRange = expenses.filter((e) => inPeriod(e.date, period, today));
    const spent = sumAmounts(inRange);
    const unpaid = expenses.filter((e) => e.status === "UNPAID"); // every unpaid bill, whatever the month
    const withReceipt = inRange.filter((e) => e.receiptUrl).length;
    const missing = inRange.length - withReceipt;
    const largest = categoryBreakdown(inRange)[0];
    const rangeName = periodLabel(period, today);

    const spentLabel =
        period === "ytd" ? "Spent this year" : isCurrentMonth ? "Spent this month" : `Spent in ${rangeName.split(" ")[0]}`;
    const spentNote = isCurrentMonth
        ? `${today.toLocaleDateString("en-US", { month: "long" })} 1–${today.getDate()}, ${today.getFullYear()} · ${plural(inRange.length, "expense")}`
        : `${rangeName} · ${plural(inRange.length, "expense")}`;
    const spendName = period === "ytd" ? "this year’s" : isCurrentMonth ? "this month’s" : "the month’s";

    function handleSave(input: ExpenseInput) {
        const expense = toSampleExpense(input, vendors);
        if (input.vendorId === null) setVendors((prev) => [...prev, expense.vendor]);
        setExpenses((prev) => [expense, ...prev]);
        setPeriod(monthKey(expense.date)); // jump to the month you just recorded into
        setFormOpen(false);
        setSaved(`${expense.vendor.name} · ${usd.format(expense.amount)} saved${expense.status === "UNPAID" ? " as an unpaid bill" : ""}.`);
    }

    function markPaid(id: string) {
        // TODO: api.expense.update.mutate({ id, status: "PAID" }) once the router lands
        setExpenses((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: "PAID", paidWith: e.paidWith ?? paymentAccounts[0]?.label ?? null } : e)),
        );
    }

    function handleExport() {
        const header = ["Date", "Vendor", "Description", "Category", "Status", "Amount", "Paid with", "Receipt"];
        const rows = [...inRange]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((e) => [
                toDateInput(e.date),
                e.vendor.name,
                e.description,
                categoryLabels[e.category],
                e.status,
                e.amount.toFixed(2),
                e.paidWith ?? "",
                e.receiptUrl ? "Yes" : "No",
            ]);
        const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-${period}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-overline uppercase text-fg-tertiary">The cost of doing good work</p>
                    <h1 className="mt-2 text-display-page">Expenses</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        Keep the small things in order. Your future self will thank you.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={handleExport} className={secondaryButton}>
                        <Download className="size-4" /> Export
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFormOpen(true);
                            setSaved(null);
                        }}
                        className={primaryButton}
                    >
                        <Plus className="size-4" /> Record expense
                    </button>
                </div>
            </div>

            {saved && (
                <div role="status" className="flex items-start gap-3 rounded-lg border border-border-default bg-accent-soft p-4 text-body-m text-fg-primary">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fg-accent" />
                    <p>
                        {saved}{" "}
                        <span className="text-fg-secondary">(Sample mode: nothing is stored until the expense router is connected.)</span>
                    </p>
                </div>
            )}

            <div className="grid grid-cols-4 gap-6">
                <StatCard label={spentLabel} value={spent} note={spentNote} highlight />
                <StatCard
                    label="Unpaid bills"
                    value={sumAmounts(unpaid)}
                    note={unpaid.length > 0 ? `${plural(unpaid.length, "bill")} still to pay` : "All caught up. Nothing to pay."}
                />
                <StatCard
                    label="Receipts attached"
                    value={`${withReceipt} of ${inRange.length}`}
                    note={
                        missing === 0
                            ? "Every expense has a receipt"
                            : `${missing === 1 ? "One expense is" : `${missing} expenses are`} missing a receipt`
                    }
                />
                <StatCard
                    label="Largest category"
                    value={largest ? categoryLabels[largest.category] : "None yet"}
                    note={largest ? `${usd.format(largest.total)} · ${percent.format(largest.share)} of ${spendName} spend` : "Nothing spent in this period"}
                />
            </div>

            <div className="grid grid-cols-12 items-start gap-6">
                <div className={`flex flex-col gap-6 ${formOpen ? "col-span-8" : "col-span-12"}`}>
                    <ExpensesTable
                        expenses={inRange}
                        period={period}
                        periods={periodOptions(expenses, today)}
                        onPeriodChange={setPeriod}
                        onMarkPaid={markPaid}
                        today={today}
                    />
                    <CategoryBreakdown expenses={inRange} periodLabel={rangeName} />
                </div>

                {formOpen && (
                    <div className="sticky top-8 col-span-4">
                        <ExpenseForm
                            vendors={vendors}
                            paymentAccounts={paymentAccounts}
                            today={today}
                            onSave={handleSave}
                            onClose={() => setFormOpen(false)}
                        />
                    </div>
                )}
            </div>

            <p className="flex items-center gap-2 text-body-s text-fg-tertiary">
                <Info className="size-4" />
                Spent includes paid and unpaid expenses. Unpaid bills counts every bill you haven’t paid yet, from any month.
            </p>
        </div>
    );
}