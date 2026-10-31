export type DisplayStatus = "draft" | "sent" | "overdue" | "paid" | "unpaid";

const styles: Record<DisplayStatus, string> = {
    draft: "bg-status-draft text-status-draft-fg",
    sent: "bg-status-sent text-status-sent-fg",
    overdue: "bg-status-overdue text-status-overdue-fg",
    paid: "bg-status-paid text-status-paid-fg",
    unpaid: "bg-status-unpaid text-status-unpaid-fg", // bills you owe
};

const labels: Record<DisplayStatus, string> = {
    draft: "Draft",
    sent: "Sent",
    overdue: "Overdue",
    paid: "Paid",
    unpaid: "Unpaid",
};

type StatusPillProps = {
    status: DisplayStatus;
    solid?: boolean; // emphasis moments only, e.g. latest payment
};

export function StatusPill({ status, solid = false }: StatusPillProps) {
    const color = solid && status === "paid" ? "bg-status-paid-solid text-fg-on-accent" : styles[status];

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-s uppercase ${color}`}>
            {labels[status]}
        </span>
    );
}