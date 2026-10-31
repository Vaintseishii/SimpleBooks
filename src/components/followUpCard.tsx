import NextLink from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { usd } from "~/lib/format";
import { primaryButton } from "./buttonStyles";

const overdue = [
    { client: "Juniper Coffee", amount: 3600, daysOverdue: 14 },
    { client: "Northstar Co.", amount: 2400, daysOverdue: 7 },
];

export function FollowUpCard() {
    const total = overdue.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="flex h-full flex-col rounded-lg bg-accent-soft p-6">
            <p className="flex items-center gap-2 text-title-card text-fg-accent">
                <Clock className="size-4" /> Time for a friendly follow-up
            </p>
            <p className="mt-6 font-mono text-num-hero">{usd.format(total)}</p>
            <p className="mt-4 text-body-m text-fg-secondary">
                {overdue.length} invoices are past due. A quick reminder can help keep your cash flowing.
            </p>

            <ul className="mt-6 flex flex-col gap-4 border-t border-border-default pt-6">
                {overdue.map((inv) => (
                    <li key={inv.client} className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-body-m">{inv.client}</p>
                            <p className="text-caption text-status-overdue-fg">{inv.daysOverdue} days overdue</p>
                        </div>
                        <span className="font-mono text-num-m">{usd.format(inv.amount)}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto pt-8">
                <NextLink href="/invoices" className={primaryButton}>
                    <ArrowRight className="size-4" /> Review overdue invoices
                </NextLink>
            </div>
        </div>
    );
}