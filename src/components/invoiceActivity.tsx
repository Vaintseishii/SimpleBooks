"use client";

import NextLink from "next/link";
import { ArrowRight, CircleCheck, Ellipsis } from "lucide-react";
import { StatusPill } from "./statusPill";
import { usd } from "~/lib/format";
import { getDisplayStatus, shortDate } from "~/lib/invoiceStatus";
import { api } from "~/trpc/react";

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });

export function InvoiceActivity() {
    // Newest first (the router sorts by issue date)
    const { data } = api.invoices.list.useQuery({ take: 100 });

    const today = new Date();
    const all = data?.invoices ?? [];
    const invoices = all.slice(0, 5);
    const latestPaid = all
        .filter((inv) => inv.paidAt)
        .sort((a, b) => b.paidAt!.getTime() - a.paidAt!.getTime())[0];

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
                    {invoices.length === 0 && (
                        <tr className="h-14 border-t border-border-subtle">
                            <td colSpan={6} className="px-6 text-fg-tertiary">
                                {data ? "No invoices yet." : "Loading…"}
                            </td>
                        </tr>
                    )}
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="h-14 border-t border-border-subtle transition-colors duration-120 ease-out hover:bg-sunken/60">
                            <td className="px-6 text-label-m text-fg-accent">{inv.number}</td>
                            <td className="py-2">
                                <p className="text-fg-primary">{inv.client.name}</p>
                                <p className="text-body-s text-fg-tertiary">{inv.projectTitle}</p>
                            </td>
                            <td className="text-fg-secondary">{shortDate.format(inv.dueDate)}</td>
                            <td>
                                <StatusPill status={getDisplayStatus(inv, today)} />
                            </td>
                            <td className="text-right font-mono text-num-m">{usd.format(inv.total)}</td>
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

            {latestPaid?.paidAt && (
                <div className="flex items-center gap-2 border-t border-border-subtle px-6 py-4 text-body-s text-fg-secondary">
                    <CircleCheck className="size-4 text-fg-accent" />
                    Latest payment: {latestPaid.client.name} paid{" "}
                    <span className="font-mono text-num-s text-fg-primary">{usd.format(latestPaid.total)}</span> on{" "}
                    {longDate.format(latestPaid.paidAt)}. Looking good.
                </div>
            )}
        </div>
    );
}
