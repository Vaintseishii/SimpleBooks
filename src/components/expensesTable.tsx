"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, CircleAlert, ListFilter, Paperclip, Search } from "lucide-react";
import { StatusPill } from "./statusPill";
import { usd } from "~/lib/format";
import { categoryIcons, categoryLabels, categoryOrder, periodLabel, sumAmounts, type Period } from "~/lib/expenseSummary";
import type { Expense, ExpenseCategory, ExpenseStatus } from "~/lib/sampleExpenses";

const rowDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

const selectClass =
    "h-9 appearance-none rounded-md border border-border-default bg-surface pr-8 pl-9 text-label-m text-fg-primary transition-colors duration-120 ease-out hover:bg-sunken focus-visible:outline-2 focus-visible:outline-border-focus";
const selectIcon = "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-secondary";
const chevron = "pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-tertiary";

type ExpensesTableProps = {
    expenses: Expense[]; // already limited to the chosen period
    period: Period;
    periods: Period[];
    onPeriodChange: (period: Period) => void;
    onMarkPaid: (id: string) => void;
    today: Date;
};

export function ExpensesTable({ expenses, period, periods, onPeriodChange, onMarkPaid, today }: ExpensesTableProps) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<ExpenseCategory | "all">("all");
    const [status, setStatus] = useState<ExpenseStatus | "all">("all");

    const q = query.trim().toLowerCase();
    const visible = expenses
        .filter((e) => !q || e.vendor.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
        .filter((e) => category === "all" || e.category === category)
        .filter((e) => status === "all" || e.status === status)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    const count = `${visible.length} expense${visible.length === 1 ? "" : "s"}`;

    return (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-card">
            {/* toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <label className="relative min-w-60 flex-1 basis-60 lg:max-w-xs">
                    <span className="sr-only">Search expenses</span>
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-tertiary" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search vendor or description"
                        className="h-10 w-full rounded-md border border-border-default bg-sunken pr-3 pl-9 text-body-m text-fg-primary placeholder:text-fg-tertiary focus:border-border-accent focus:outline-none"
                    />
                </label>

                <div className="flex shrink-0 flex-wrap gap-3">
                    <div className="relative">
                        <CalendarDays className={selectIcon} />
                        <select aria-label="Period" value={period} onChange={(e) => onPeriodChange(e.target.value)} className={selectClass}>
                            {periods.map((p) => (
                                <option key={p} value={p}>{periodLabel(p, today)}</option>
                            ))}
                        </select>
                        <ChevronDown className={chevron} />
                    </div>
                    <div className="relative">
                        <ListFilter className={selectIcon} />
                        <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory | "all")} className={selectClass}>
                            <option value="all">All categories</option>
                            {categoryOrder.map((c) => (
                                <option key={c} value={c}>{categoryLabels[c]}</option>
                            ))}
                        </select>
                        <ChevronDown className={chevron} />
                    </div>
                    <div className="relative">
                        <ListFilter className={selectIcon} />
                        <select aria-label="Filter by payment status" value={status} onChange={(e) => setStatus(e.target.value as ExpenseStatus | "all")} className={selectClass}>
                            <option value="all">Paid and unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid bills</option>
                        </select>
                        <ChevronDown className={chevron} />
                    </div>
                </div>
            </div>

            {/* table */}
            <table className="w-full text-left">
                <thead className="bg-sunken text-label-s text-fg-tertiary">
                    <tr className="h-10">
                        <th className="pl-6 font-medium">Vendor / description</th>
                        <th className="font-medium">Date</th>
                        <th className="font-medium">Category</th>
                        <th className="font-medium">Status</th>
                        <th className="text-right font-medium">Amount</th>
                        <th className="w-14"><span className="sr-only">Receipt</span></th>
                    </tr>
                </thead>
                <tbody className="text-body-m">
                    {visible.map((e) => {
                        const Icon = categoryIcons[e.category];
                        return (
                            <tr key={e.id} className="h-16 border-t border-border-subtle transition-colors duration-120 ease-out hover:bg-sunken/60">
                                <td className="py-3 pl-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-secondary">
                                            <Icon className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-fg-primary">{e.vendor.name}</p>
                                            <p className="truncate text-body-s text-fg-tertiary">{e.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-fg-secondary">{rowDate.format(e.date)}</td>
                                <td className="text-fg-secondary">{categoryLabels[e.category]}</td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <StatusPill status={e.status === "PAID" ? "paid" : "unpaid"} />
                                        {e.status === "UNPAID" && (
                                            <button
                                                type="button"
                                                onClick={() => onMarkPaid(e.id)}
                                                className="rounded-xs text-label-s text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
                                            >
                                                Mark paid
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="text-right font-mono text-num-m">{usd.format(e.amount)}</td>
                                <td className="text-center">
                                    {e.receiptUrl ? (
                                        <span title={`Receipt attached: ${e.receiptUrl}`} className="inline-flex text-fg-tertiary">
                                            <Paperclip className="size-4" />
                                            <span className="sr-only">Receipt attached</span>
                                        </span>
                                    ) : (
                                        <span title="Receipt missing" className="inline-flex text-status-unpaid-fg">
                                            <CircleAlert className="size-4" />
                                            <span className="sr-only">Receipt missing</span>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {visible.length === 0 && (
                        <tr className="border-t border-border-subtle">
                            <td colSpan={6} className="px-6 py-12 text-center text-body-m text-fg-secondary">
                                {expenses.length === 0
                                    ? "No expenses in this period yet. Record one when it happens."
                                    : "No expenses match that. Try another search or filter."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
                <span className="text-body-s text-fg-secondary">
                    {count} · {periodLabel(period, today)}
                </span>
                <span className="text-label-m">
                    Total <span className="ml-2 font-mono text-num-m">{usd.format(sumAmounts(visible))}</span>
                </span>
            </div>
        </div>
    );
}