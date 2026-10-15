type StatCardProps = { label: string; value: number; note: string; highlight?: boolean };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function StatCard({ label, value, note, highlight = false }: StatCardProps) {
    const muted = highlight ? "text-white/80" : "text-text-muted";

    return (
        <div className={`rounded-2xl border p-6 ${highlight ? "border-brand bg-brand text-white" : "border-border bg-surface"}`}>
            <p className={`text-sm ${muted}`}>{label}</p>
            <p className="mt-3 text-3xl">{usd.format(value)}</p>
            <p className={`mt-3 text-sm ${muted}`}>{note}</p>
        </div>
    );
}