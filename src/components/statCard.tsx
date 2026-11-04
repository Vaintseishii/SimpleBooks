import { usd } from "~/lib/format";

type StatCardProps = {
    label: string;
    value: number | string;
    note: string;
    highlight?: boolean;
    overdue?: boolean;
    gradient?: boolean;
};

export function StatCard({ label, value, note, highlight = false, overdue = false, gradient = false }: StatCardProps) {
    const isMoney = typeof value === "number";
    const valueColor = overdue ? "text-status-overdue-fg" : "";

    const baseCard = "rounded-xl border p-6 transition-shadow duration-200 ease-out";
    const shadowClass = "shadow-card-elevated hover:shadow-card-hover";
    
    let cardClass = baseCard;
    if (gradient) {
        cardClass += " card-gradient text-on-gradient border-transparent";
    } else if (highlight) {
        cardClass += " border-accent bg-accent text-fg-on-accent";
    } else {
        cardClass += " border-border-default bg-surface";
    }
    cardClass += ` ${shadowClass}`;

    const muted = gradient ? "text-on-gradient/70" : (highlight ? "text-fg-on-accent/80" : "text-fg-secondary");
    const noteColor = overdue ? "text-status-overdue-fg" : muted;

    return (
        <div className={cardClass}>
            <p className={`text-body-s ${muted}`}>{label}</p>
            <p className={`mt-3 text-num-l font-semibold ${valueColor}`}>
                {isMoney ? usd.format(value) : value}
            </p>
            <p className={`mt-3 text-caption ${noteColor}`}>{note}</p>
        </div>
    );
}