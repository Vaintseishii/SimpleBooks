"use client";

import { ChevronDown } from "lucide-react";
import { secondaryButton } from "./buttonStyles";
import { api } from "~/trpc/react";

// Same "2026-11" keys the report router uses for interval "month"
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function CashFlowChart() {
    // The router only knows "thisMonth" and "yearToDate", so months before January show $0 for now
    const { data: rows = [] } = api.reports.cashFlow.useQuery({ period: "yearToDate", interval: "month" });

    const today = new Date();
    const data = [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
        const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
        const row = rows.find((r) => r.period === monthKey(d));
        return {
            month: d.toLocaleDateString("en-US", { month: "short" }),
            moneyIn: row?.inflow ?? 0,
            moneyOut: row?.outflow ?? 0,
        };
    });

    // Round the top of the chart up to a multiple of $3k so the three gridlines land on whole thousands
    const biggest = Math.max(0, ...data.map((d) => Math.max(d.moneyIn, d.moneyOut)));
    const max = Math.max(3000, Math.ceil(biggest / 3000) * 3000);
    const ticks = [max, (max * 2) / 3, max / 3, 0];
    const pct = (value: number) => `${(value / max) * 100}%`;

    return (
        <div className="h-full rounded-lg border border-border-default bg-surface p-6 shadow-card">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-title-section">Money in, money out</h2>
                    <p className="mt-1 text-body-s text-fg-secondary">Your cash flow over the last six months</p>
                </div>
                <button type="button" className={secondaryButton}>
                    Last 6 months <ChevronDown className="size-4" />
                </button>
            </div>

            <div className="mt-8 flex gap-4">
                <div className="flex h-64 w-10 flex-col justify-between text-right font-mono text-num-s text-fg-tertiary">
                    {ticks.map((t) => (
                        <span key={t}>{t === 0 ? "$0" : `$${t / 1000}k`}</span>
                    ))}
                </div>
                <div className="relative grid h-64 flex-1 grid-cols-6 border-b border-border-default">
                    {ticks.slice(0, -1).map((t) => (
                        <div key={t} className="absolute inset-x-0 border-t border-border-subtle" style={{ bottom: pct(t) }} />
                    ))}
                    {data.map((d) => (
                        <div key={d.month} className="relative flex h-full items-end justify-center gap-1.5">
                            <div className="w-6 rounded-t-xs bg-chart-1" style={{ height: pct(d.moneyIn) }} />
                            <div className="w-6 rounded-t-xs bg-chart-2" style={{ height: pct(d.moneyOut) }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2 grid grid-cols-6 pl-14 text-center text-caption text-fg-tertiary">
                {data.map((d, i) => (
                    <span key={d.month} className={i === data.length - 1 ? "font-medium text-fg-primary" : ""}>
                        {d.month}
                    </span>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-body-s text-fg-secondary">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-1" /> Money in</span>
                    <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-2" /> Money out</span>
                </div>
                <span className="text-caption text-fg-tertiary">{data[5]?.month} through today</span>
            </div>
        </div>
    );
}
