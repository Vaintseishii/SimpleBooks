import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { usd } from "~/lib/format";
import { plural } from "~/lib/receivables";

type BalanceSummaryProps = {
    pendingIncome: number; // every sent, unpaid invoice
    invoiceCount: number;
    unpaidBills: number; // every UNPAID expense
    billCount: number;
};

// Spec: "Outstanding balances: total pending income vs. total unpaid bills"
export function BalanceSummary({ pendingIncome, invoiceCount, unpaidBills, billCount }: BalanceSummaryProps) {
    const largest = Math.max(pendingIncome, unpaidBills, 1);
    const difference = pendingIncome - unpaidBills;

    const rows = [
        { label: "Pending income", note: `${plural(invoiceCount, "unpaid invoice")}`, value: pendingIncome, bar: "bg-chart-1" },
        { label: "Unpaid bills", note: `${plural(billCount, "bill")} you still owe`, value: unpaidBills, bar: "bg-chart-3" },
    ];

    return (
        <section className="rounded-lg border border-border-default bg-surface p-6 shadow-card">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-title-section">Coming in vs. going out</h2>
                <NextLink
                    href="/expenses"
                    className="inline-flex items-center gap-1 rounded-sm text-label-m text-fg-accent hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    See unpaid bills <ArrowRight className="size-4" />
                </NextLink>
            </div>
            <p className="mt-2 max-w-[65ch] text-body-m text-fg-secondary">
                What clients owe you, next to the bills you haven’t paid yet.
            </p>

            <dl className="mt-6 flex flex-col gap-5">
                {rows.map((row) => (
                    <div key={row.label}>
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="text-body-m text-fg-primary">
                                {row.label} <span className="text-caption text-fg-tertiary">· {row.note}</span>
                            </dt>
                            <dd className="font-mono text-num-m text-fg-primary">{usd.format(row.value)}</dd>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-sunken" aria-hidden>
                            <div className={`h-2 rounded-full ${row.bar}`} style={{ width: `${(row.value / largest) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </dl>

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-border-subtle pt-5">
                <p className="text-body-m text-fg-secondary">
                    {difference >= 0 ? "Left over once everyone pays and every bill is paid" : "Bills are ahead of what’s coming in"}
                </p>
                <p className="font-mono text-num-l text-fg-primary">
                    {difference < 0 ? "−" : ""}
                    {usd.format(Math.abs(difference))}
                </p>
            </div>
        </section>
    );
}