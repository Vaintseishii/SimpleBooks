"use client";

import { useState } from "react";
import { CheckCircle2, Info, Plus } from "lucide-react";
import { StatCard } from "./statCard";
import { ExpensesTable } from "./expensesTable";
import { ExpenseForm } from "./expenseForm";
import { CategoryBreakdown } from "./categoryBreakdown";
import { primaryButton } from "./buttonStyles";
import { usd } from "~/lib/format";
import type { ExpenseInput } from "~/lib/expenseDraft";
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
import type { Expense } from "~/lib/sampleExpenses";
import { api } from "~/trpc/react";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

export function ExpensesView() {
    const [today] = useState(() => new Date());
    const [period, setPeriod] = useState<Period>(monthKey(today));
    const [formOpen, setFormOpen] = useState(false);
    const [saved, setSaved] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const utils = api.useUtils();
    const expenseList = api.expenses.list.useQuery({ take: 100 });
    const vendorList = api.vendors.list.useQuery({ take: 100 });
    const createVendor = api.vendors.create.useMutation();
    const createExpense = api.expenses.create.useMutation();
    const updateExpense = api.expenses.update.useMutation();

    const vendors = vendorList.data ?? [];
    // Reshape the router rows into the Expense type the table, cards and chart already use
    const expenses: Expense[] = (expenseList.data?.expenses ?? []).map((e) => ({
        id: e.id,
        vendor: { id: e.vendorId, name: e.vendor?.name ?? "Unknown vendor" },
        description: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
        status: e.status === "UNPAID" ? "UNPAID" : "PAID",
        notes: e.notes,
    }));

    const isCurrentMonth = period === monthKey(today);
    const inRange = expenses.filter((e) => inPeriod(e.date, period, today));
    const spent = sumAmounts(inRange);
    const unpaid = expenses.filter((e) => e.status === "UNPAID"); // every unpaid bill, whatever the month
    const largest = categoryBreakdown(inRange)[0];
    const rangeName = periodLabel(period, today);

    const spentLabel =
        period === "ytd" ? "Spent this year" : isCurrentMonth ? "Spent this month" : `Spent in ${rangeName.split(" ")[0]}`;
    const spentNote = isCurrentMonth
        ? `${today.toLocaleDateString("en-US", { month: "long" })} 1–${today.getDate()}, ${today.getFullYear()} · ${plural(inRange.length, "expense")}`
        : `${rangeName} · ${plural(inRange.length, "expense")}`;
    const spendName = period === "ytd" ? "this year’s" : isCurrentMonth ? "this month’s" : "the month’s";

    async function handleSave(input: ExpenseInput) {
        setError(null);
        try {
            // A new vendor name gets created first, because an expense needs a vendorId
            const vendorId = input.vendorId ?? (await createVendor.mutateAsync({ name: input.newVendorName ?? "New vendor" })).id;
            const expense = await createExpense.mutateAsync({
                vendorId,
                description: input.description,
                amount: input.amount,
                date: input.date,
                category: input.category,
                status: input.status,
                notes: input.notes,
            });
            await Promise.all([utils.expenses.list.invalidate(), utils.vendors.list.invalidate()]);
            setPeriod(monthKey(input.date)); // jump to the month you just recorded into
            setFormOpen(false);
            setSaved(`${expense.vendor.name} · ${usd.format(input.amount)} saved${input.status === "UNPAID" ? " as an unpaid bill" : ""}.`);
        } catch {
            setError("Couldn’t save that expense. Please try again.");
        }
    }

    async function markPaid(id: string) {
        setError(null);
        try {
            await updateExpense.mutateAsync({ id, status: "PAID" });
            await utils.expenses.list.invalidate();
        } catch {
            setError("Couldn’t mark that bill as paid. Please try again.");
        }
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
                <button
                    type="button"
                    onClick={() => {
                        setFormOpen(true);
                        setSaved(null);
                    }}
                    className={`${primaryButton} shrink-0`}
                >
                    <Plus className="size-4" /> Record expense
                </button>
            </div>

            {saved && (
                <div role="status" className="flex items-start gap-3 rounded-lg border border-border-default bg-accent-soft p-4 text-body-m text-fg-primary">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fg-accent" />
                    <p>{saved}</p>
                </div>
            )}

            {error && (
                <p role="alert" className="rounded-lg bg-status-overdue p-4 text-body-m text-status-overdue-fg">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-3 gap-6">
                <StatCard label={spentLabel} value={spent} note={spentNote} highlight />
                <StatCard
                    label="Unpaid bills"
                    value={sumAmounts(unpaid)}
                    note={unpaid.length > 0 ? `${plural(unpaid.length, "bill")} still to pay` : "All caught up. Nothing to pay."}
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
                        onMarkPaid={(id) => void markPaid(id)}
                        today={today}
                    />
                    <CategoryBreakdown expenses={inRange} periodLabel={rangeName} />
                </div>

                {formOpen && (
                    <div className="sticky top-8 col-span-4">
                        <ExpenseForm
                            vendors={vendors}
                            today={today}
                            onSave={(input) => void handleSave(input)}
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