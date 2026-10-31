import { ChevronDown } from "lucide-react";
import { secondaryButton } from "./buttonStyles";

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
                <span className="text-caption text-fg-tertiary">Oct through today</span>
            </div>
        </div>
    );
}