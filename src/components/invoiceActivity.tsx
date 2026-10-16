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
    { number: "INV-1051", client: "Bloom Wellness", project: "Brand guidelines", dueDate: "Oct 28, 2026", status: "unpaid", amount: 2850 },
    { number: "INV-1050", client: "Forma Objects", project: "Packaging design", dueDate: "Oct 20, 2026", status: "unpaid", amount: 1800 },
    { number: "INV-1047", client: "Willow Home", project: "E-commerce design", dueDate: "Oct 12, 2026", status: "paid", amount: 4200 },
];

export function InvoiceActivity() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between px-8 py-6">
                <h2 className="text-xl">Invoice activity</h2>
                <NextLink href="/invoices" className="flex items-center gap-2 text-sm text-brand hover:underline">
                    <ArrowRight className="size-4" /> View all invoices
                </NextLink>
            </div>

            <table className="w-full text-left text-sm">
                <thead className="bg-page text-text-muted">
                    <tr>
                        <th className="px-8 py-4 font-normal">Invoice</th>
                        <th className="py-4 font-normal">Client / project</th>
                        <th className="py-4 font-normal">Due date</th>
                        <th className="py-4 font-normal">Status</th>
                        <th className="py-4 text-right font-normal">Amount</th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((inv) => (
                        <tr key={inv.number} className="border-t border-border">
                            <td className="px-8 py-5 font-medium text-brand">{inv.number}</td>
                            <td className="py-5">
                                <p>{inv.client}</p>
                                <p className="text-text-muted">{inv.project}</p>
                            </td>
                            <td className="py-5 text-text-muted">{inv.dueDate}</td>
                            <td className="py-5">
                                <StatusPill status={inv.status} />
                            </td>
                            <td className="py-5 text-right">{usd.format(inv.amount)}</td>
                            <td className="py-5 text-center">
                                <button type="button" className="rounded p-1 text-text-muted hover:bg-page" aria-label="More actions">
                                    <Ellipsis className="size-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex items-center gap-2 border-t border-border px-8 py-4 text-sm text-text-muted">
                <CircleCheck className="size-4" />
                Latest payment: Willow Home paid $4,200.00 on October 12. Looking good.
            </div>
        </div>
    );
}