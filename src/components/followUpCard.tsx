import NextLink from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { usd, usdWhole } from "~/lib/format";

const overdue = [
    { client: "Juniper Coffee", amount: 3600, daysOverdue: 14 },
    { client: "Northstar Co.", amount: 2400, daysOverdue: 7 },
];

export function FollowUpCard() {
    const total = overdue.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="flex flex-col rounded-2xl bg-brand-soft p-8">
            <p className="flex items-center gap-2 text-brand">
                <Clock className="size-5" /> Time for a friendly follow-up
            </p>
            <p className="mt-6 text-4xl text-brand">{usd.format(total)}</p>
            <p className="mt-6 text-sm">
                {overdue.length} invoices are past due. A quick reminder can help keep your cash flowing.
            </p>

            <ul className="mt-6 flex flex-col gap-4 border-t border-brand/15 pt-6">
                {overdue.map((inv) => (
                    <li key={inv.client} className="flex justify-between">
                        <div>
                            <p>{inv.client}</p>
                            <p className="text-xs text-text-muted">{inv.daysOverdue} days overdue</p>
                        </div>
                        <span>{usdWhole.format(inv.amount)}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto pt-8">
                <NextLink
                    href="/invoices"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm text-white hover:bg-brand/90"
                >
                    <ArrowRight className="size-4" /> Review overdue invoices
                </NextLink>
            </div>
        </div>
    );
}