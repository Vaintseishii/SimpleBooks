"use client";

import NextLink from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { usd } from "~/lib/format";
import { getDisplayStatus } from "~/lib/invoiceStatus";
import { daysBetween, plural } from "~/lib/receivables";
import { api } from "~/trpc/react";
import { primaryButton } from "./buttonStyles";

export function FollowUpCard() {
    // Same query as the sidebar badge, so they share one cached request
    const { data } = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet

    const today = new Date();
    const overdue = (data?.invoices ?? [])
        .filter((inv) => getDisplayStatus(inv, today) === "overdue")
        .map((inv) => ({
            id: inv.id,
            client: inv.client.name,
            amount: inv.total,
            daysOverdue: daysBetween(inv.dueDate, today),
        }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue);
    const total = overdue.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="flex h-full flex-col rounded-lg bg-accent-soft p-6">
            <p className="flex items-center gap-2 text-title-card text-fg-accent">
                <Clock className="size-4" /> Time for a friendly follow-up
            </p>
            <p className="mt-6 font-mono text-num-hero">{usd.format(total)}</p>
            <p className="mt-4 text-body-m text-fg-secondary">
                {overdue.length === 0
                    ? "Nothing is past due right now. Nice work."
                    : `${plural(overdue.length, "invoice")} past due. A quick reminder can help keep your cash flowing.`}
            </p>

            {overdue.length > 0 && (
                <ul className="mt-6 flex flex-col gap-4 border-t border-border-default pt-6">
                    {overdue.map((inv) => (
                        <li key={inv.id} className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-body-m">{inv.client}</p>
                                <p className="text-caption text-status-overdue-fg">{plural(inv.daysOverdue, "day")} overdue</p>
                            </div>
                            <span className="font-mono text-num-m">{usd.format(inv.amount)}</span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-auto pt-8">
                <NextLink href="/who-owes-you" className={primaryButton}>
                    <ArrowRight className="size-4" /> Review overdue invoices
                </NextLink>
            </div>
        </div>
    );
}
