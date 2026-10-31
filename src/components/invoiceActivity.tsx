import NextLink from "next/link";
import { ArrowRight, CircleCheck, Ellipsis } from "lucide-react";
import { StatusPill, type DisplayStatus } from "./statusPill";
import { usd } from "~/lib/format";

type InvoiceRow = {
    number: string;
    client: string;
    project: string;
    dueDate: string;
    status: DisplayStatus;
    amount: number;
};

const invoices: InvoiceRow[] = [
    { number: "INV-1051", client: "Bloom Wellness", project: "Brand guidelines", dueDate: "Oct 28, 2026", status: "sent", amount: 2850 },
    { number: "INV-1050", client: "Forma Objects", project: "Packaging design", dueDate: "Oct 20, 2026", status: "sent", amount: 1800 },
    { number: "INV-1047", client: "Willow Home", project: "E-commerce design", dueDate: "Oct 12, 2026", status: "paid", amount: 4200 },
];

export function InvoiceActivity() {
    return (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-card">
            <div className="flex items-center justify-between p-6">
                <h2 className="text-title-section">Invoice activity</h2>
                <NextLink
                    href="/invoices"
                    className="flex items-center gap-2 rounded-xs text-label-m text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                >
                    View all invoices <ArrowRight className="size-4" />
                </NextLink>
            </div>

            <table className="w-full text-left">
                <thead className="bg-sunken text-label-s text-fg-tertiary">
                    <tr className="h-10">
                        <th className="px-6 font-medium">Invoice</th>
                        <th className="font-medium">Client / project</th>
                        <th className="font-medium">Due date</th>
                        <th className="font-medium">Status</th>
                        <th className="text-right font-medium">Amount</th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody className="text-body-m">
                    {invoices.map((inv) => (
                        <tr key={inv.number} className="h-14 border-t border-border-subtle transition-colors duration-120 ease-out hover:bg-sunken/60">
                            <td className="px-6 text-label-m text-fg-accent">{inv.number}</td>
                            <td className="py-2">
                                <p className="text-fg-primary">{inv.client}</p>
                                <p className="text-body-s text-fg-tertiary">{inv.project}</p>
                            </td>
                            <td className="text-fg-secondary">{inv.dueDate}</td>
                            <td>
                                <StatusPill status={inv.status} />
                            </td>
                            <td className="text-right font-mono text-num-m">{usd.format(inv.amount)}</td>
                            <td className="text-center">
                                <button
                                    type="button"
                                    aria-label="More actions"
                                    className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                                >
                                    <Ellipsis className="size-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex items-center gap-2 border-t border-border-subtle px-6 py-4 text-body-s text-fg-secondary">
                <CircleCheck className="size-4 text-fg-accent" />
                Latest payment: Willow Home paid <span className="font-mono text-num-s text-fg-primary">{usd.format(4200)}</span> on October 12. Looking good.
            </div>
        </div>
    );
}