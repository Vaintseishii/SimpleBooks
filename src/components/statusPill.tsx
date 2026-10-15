export type DisplayStatus = "draft" | "unpaid" | "overdue" | "paid";

const styles: Record<DisplayStatus, string> = {
    draft: "bg-border/70 text-text-muted",
    unpaid: "bg-warning/15 text-warning",
    overdue: "bg-danger/10 text-danger",
    paid: "bg-brand-soft text-brand",
};

const labels: Record<DisplayStatus, string> = {
    draft: "Draft",
    unpaid: "Unpaid",
    overdue: "Overdue",
    paid: "Paid",
};

export function StatusPill({ status }: { status: DisplayStatus }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${styles[status]}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {labels[status]}
        </span>
    );
}