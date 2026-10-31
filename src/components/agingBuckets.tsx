import { usd } from "~/lib/format";
import { agingBuckets, plural, sumBalances, type AgingBucket, type Balance } from "~/lib/receivables";

const barColor: Record<AgingBucket["key"], string> = {
    current: "bg-chart-1/45",
    "1-30": "bg-chart-4",
    "31+": "bg-chart-negative",
};

const valueColor: Record<AgingBucket["key"], string> = {
    current: "text-fg-accent",
    "1-30": "text-status-overdue-fg",
    "31+": "text-status-overdue-fg",
};

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

type AgingBucketsProps = { balances: Balance[]; today: Date };

export function AgingBuckets({ balances, today }: AgingBucketsProps) {
    const buckets = agingBuckets(balances);
    const total = sumBalances(balances);

    return (
        <section className="rounded-lg border border-border-default bg-surface p-6 shadow-card">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-title-section">How long has it been?</h2>
                <p className="text-body-s text-fg-tertiary">As of {longDate.format(today)}</p>
            </div>

            {/* one bar, split by how late the money is */}
            <div className="mt-6 flex h-2 gap-1" aria-hidden>
                {total === 0 ? (
                    <span className="flex-1 rounded-full bg-sunken" />
                ) : (
                    buckets
                        .filter((b) => b.total > 0)
                        .map((b) => (
                            <span
                                key={b.key}
                                className={`rounded-full ${barColor[b.key]}`}
                                style={{ width: `${(b.total / total) * 100}%` }}
                            />
                        ))
                )}
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-6">
                {buckets.map((b) => {
                    const empty = b.balances.length === 0;
                    return (
                        <div key={b.key}>
                            <dt className="flex items-center gap-2 text-body-s text-fg-secondary">
                                <span aria-hidden className={`size-2 rounded-full ${barColor[b.key]}`} />
                                {b.label}
                            </dt>
                            <dd className={`mt-2 font-mono text-num-l ${empty ? "text-fg-tertiary" : valueColor[b.key]}`}>
                                {usd.format(b.total)}
                            </dd>
                            <dd className="mt-1 text-caption text-fg-tertiary">
                                {empty ? "No invoices" : plural(b.balances.length, "invoice")}
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
}