"use client";

import { StatCard } from "./statCard";
import { usd } from "~/lib/format";
import { getDisplayStatus } from "~/lib/invoiceStatus";
import { plural } from "~/lib/receivables";
import { api } from "~/trpc/react";

export function OverviewStats() {
    const { data: pnl } = api.reports.profitAndLoss.useQuery({ period: "thisMonth" });
    const { data: sent } = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet

    const today = new Date();
    const unpaid = sent?.invoices ?? [];
    const overdue = unpaid.filter((inv) => getDisplayStatus(inv, today) === "overdue");
    const outstanding = unpaid.reduce((sum, inv) => sum + inv.total, 0);
    const overdueTotal = overdue.reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="grid grid-cols-4 gap-6">
            <StatCard
                label="Money in"
                value={pnl?.revenue ?? 0}
                note={`${plural(pnl?.invoiceCount ?? 0, "invoice")} paid this month`}
                highlight
            />
            <StatCard
                label="Money out"
                value={pnl?.totalExpenses ?? 0}
                note={`${plural(pnl?.expenseCount ?? 0, "paid expense")} this month`}
            />
            <StatCard label="Net income" value={pnl?.netProfit ?? 0} note="Money in, less business expenses" />
            <StatCard
                label="Outstanding"
                value={outstanding}
                note={`${usd.format(overdueTotal)} is overdue · ${plural(overdue.length, "invoice")}`}
            />
        </div>
    );
}