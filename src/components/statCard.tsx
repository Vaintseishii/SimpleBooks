import { usd } from "~/lib/format";

type StatCardProps = { label: string; value: number; note: string; highlight?: boolean };

export function StatCard({ label, value, note, highlight = false }: StatCardProps) {
    const muted = highlight ? "text-fg-on-accent/80" : "text-fg-secondary";

    return (
        <div
            className={`rounded-lg border p-6 shadow-card ${
                highlight ? "border-accent bg-accent text-fg-on-accent" : "border-border-default bg-surface"
            }`}
        >
            <p className={`text-body-s ${muted}`}>{label}</p>
            <p className="mt-3 font-mono text-num-l">{usd.format(value)}</p>
            <p className={`mt-3 text-caption ${muted}`}>{note}</p>
        </div>
    );
}