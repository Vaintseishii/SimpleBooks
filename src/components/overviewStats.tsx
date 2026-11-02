"use client";

import { useState } from "react";
import { StatCard } from "./statCard";
import { usd } from "~/lib/format";
import { getDisplayStatus } from "~/lib/invoiceStatus";
import { plural } from "~/lib/receivables";
import { api } from "~/trpc/react";

// The spec asks for net income over "This Month" and "Year-to-Date"
type Period = "thisMonth" | "yearToDate";

const periodOptions: { value: Period; label: string }[] = [
    { value: "thisMonth", label: "This month" },
    { value: "yearToDate", label: "Year to date" },
];

export function OverviewStats() {
    const [period, setPeriod] = useState<Period>("thisMonth");
    const { data: pnl } = api.reports.profitAndLoss.useQuery({ period });
    const { data: sent } = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet

    const today = new Date();
    const unpaid = sent?.invoices ?? [];
    const overdue = unpaid.filter((inv) => getDisplayStatus(inv, today) === "overdue");
    const outstanding = unpaid.reduce((sum, inv) => sum + inv.total, 0);
    const overdueTotal = overdue.reduce((sum, inv) => sum + inv.total, 0);

    const isMonth = period === "thisMonth";
    const shortMonth = today.toLocaleDateString("en-US", { month: "short" });
    const heading = isMonth
        ? today.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : String(today.getFullYear());
    const range = isMonth
        ? `Month to date · ${shortMonth} 1–${today.getDate()}`
        : `Year to date · Jan 1–${shortMonth} ${today.getDate()}`;
    const when = isMonth ? "this month" : "this year";

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-label-m">{heading}</span>
                    <span className="text-body-s text-fg-tertiary">{range}</span>
                </div>
                <div role="radiogroup" aria-label="Period" className="grid grid-cols-2 gap-1 rounded-md border border-border-default bg-sunken p-1">
                    {periodOptions.map((option) => {
                        const active = period === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setPeriod(option.value)}
                                className={`h-8 rounded-sm px-3 text-label-m transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:outline-border-focus ${
                                    active ? "bg-surface text-fg-primary shadow-card" : "text-fg-secondary hover:text-fg-primary"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <StatCard
                    label="Money in"
                    value={pnl?.revenue ?? 0}
                    note={`${plural(pnl?.invoiceCount ?? 0, "invoice")} paid ${when}`}
                    highlight
                />
                <StatCard
                    label="Money out"
                    value={pnl?.totalExpenses ?? 0}
                    note={`${plural(pnl?.expenseCount ?? 0, "paid expense")} ${when}`}
                />
                <StatCard label="Net income" value={pnl?.netProfit ?? 0} note="Money in, less business expenses" />
                <StatCard
                    label="Outstanding"
                    value={outstanding}
                    note={`${usd.format(overdueTotal)} is overdue · ${plural(overdue.length, "invoice")}`}
                />
            </div>
        </div>
    );
}