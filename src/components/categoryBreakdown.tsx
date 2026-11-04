import { formatMoney } from "~/lib/format";
import { categoryBreakdown, categoryColors, categoryLabels } from "~/lib/expenseSummary";
import type { Expense } from "~/lib/sampleExpenses";

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

type CategoryBreakdownProps = {
    expenses: Expense[];
    periodLabel: string;
    currency: string; // workspace default; these totals span records
};

// Category split as one stacked bar (the design system's answer to a pie chart)
export function CategoryBreakdown({ expenses, periodLabel, currency }: CategoryBreakdownProps) {
    const totals = categoryBreakdown(expenses);

    return (
        <section className="rounded-lg border border-border-default bg-surface p-6 shadow-card-elevated hover:shadow-card-hover transition-shadow duration-200 ease-out">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-title-section">Where your money went</h2>
                <span className="text-caption text-fg-tertiary">{periodLabel}</span>
            </div>

            {totals.length === 0 ? (
                <p className="mt-6 text-body-m text-fg-secondary">Nothing spent in this period yet.</p>
            ) : (
                <>
                    <div
                        role="img"
                        aria-label={totals
                            .map((t) => `${categoryLabels[t.category]} ${percent.format(t.share)}`)
                            .join(", ")}
                        className="mt-6 flex h-3 gap-0.5 overflow-hidden rounded-full"
                    >
                        {totals.map((t) => (
                            <div
                                key={t.category}
                                title={`${categoryLabels[t.category]} · ${formatMoney(t.total, currency)}`}
                                className={`${categoryColors[t.category]} h-full`}
                                style={{ width: `${t.share * 100}%` }}
                            />
                        ))}
                    </div>

                    <ul className="mt-6 grid grid-cols-5 gap-4">
                        {totals.map((t) => (
                            <li key={t.category}>
                                <span className="flex items-center gap-2 text-body-s text-fg-secondary">
                                    <span className={`size-2.5 rounded-xs ${categoryColors[t.category]}`} />
                                    {categoryLabels[t.category]}
                                </span>
                                <p className="mt-1 font-mono text-num-l">{formatMoney(t.total, currency)}</p>
                                <p className="font-mono text-num-s text-fg-tertiary">{percent.format(t.share)}</p>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}