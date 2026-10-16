import { ChevronDown } from "lucide-react";

const data = [
    { month: "May", moneyIn: 7400, moneyOut: 1500 },
    { month: "Jun", moneyIn: 8800, moneyOut: 1800 },
    { month: "Jul", moneyIn: 8100, moneyOut: 1400 },
    { month: "Aug", moneyIn: 10700, moneyOut: 2100 },
    { month: "Sep", moneyIn: 9400, moneyOut: 1700 },
    { month: "Oct", moneyIn: 9800, moneyOut: 1284 },
];
const max = 12000;
const ticks = [12000, 8000, 4000, 0];
const pct = (value: number) => `${(value / max) * 100}%`;

export function CashFlowChart() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl">Money in, money out</h2>
                    <p className="mt-1 text-sm text-text-muted">Your cash flow over the last six months</p>
                </div>
                <span className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <ChevronDown className="size-4" /> Last 6 months
                </span>
            </div>

            <div className="mt-8 flex gap-4">
                <div className="flex h-64 w-10 flex-col justify-between text-xs text-text-muted">
                    {ticks.map((t) => (
                        <span key={t}>{t === 0 ? "$0" : `$${t / 1000}k`}</span>
                    ))}
                </div>
                <div className="relative grid h-64 flex-1 grid-cols-6 border-b border-border">
                    {ticks.slice(0, -1).map((t) => (
                        <div key={t} className="absolute inset-x-0 border-t border-border" style={{ bottom: pct(t) }} />
                    ))}
                    {data.map((d) => (
                        <div key={d.month} className="relative flex h-full items-end justify-center gap-2">
                            <div className="w-8 rounded-t bg-brand" style={{ height: pct(d.moneyIn) }} />
                            <div className="w-8 rounded-t bg-brand/35" style={{ height: pct(d.moneyOut) }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2 grid grid-cols-6 pl-14 text-center text-sm text-text-muted">
                {data.map((d, i) => (
                    <span key={d.month} className={i === data.length - 1 ? "font-medium text-text" : ""}>
                        {d.month}
                    </span>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-text-muted">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-brand" /> Money in</span>
                    <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-brand/35" /> Money out</span>
                </div>
                <span className="text-xs">Oct through today</span>
            </div>
        </div>
    );
}