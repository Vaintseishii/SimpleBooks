"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { primaryButton, secondaryButton } from "~/components/buttonStyles";
import { Skeleton, SkeletonCard } from "~/components/skeleton";
import { formatMoney } from "~/lib/format";
import { shortDate } from "~/lib/invoiceStatus";

function formatDate(date: Date | string | null | undefined) {
    if (!date) return "—";
    return shortDate.format(new Date(date));
}

// A print-optimised invoice document. The app sidebar and header are hidden by
// the print rules in globals.css, so the document uses explicit white/black
// colours and borders that survive "Save as PDF".
export function PrintInvoiceClient() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const { data: invoice, isPending, error } = api.invoices.byId.useQuery(
        { id },
        { enabled: !!id },
    );
    const { data: workspace } = api.workspace.get.useQuery();

    if (isPending) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Skeleton className="h-11 w-36" />
                    <Skeleton className="h-11 w-44" />
                </div>
                <SkeletonCard className="h-[48rem]" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <p className="text-body-m text-fg-secondary">This invoice could not be found.</p>
            </div>
        );
    }

    // Every amount on the document is in the invoice's own saved currency.
    // Money arrives from Prisma as a Decimal, so go through Number() first.
    const money = (value: unknown) => formatMoney(Number(value), invoice.currency);
    const hasDiscount = Number(invoice.discount) > 0;
    const hasTax = Number(invoice.taxRate) > 0;
    const payments = invoice.payments ?? [];

    return (
        <div>
            {/* Toolbar — never appears on paper */}
            <div className="print-chrome mx-auto mb-6 flex max-w-3xl items-center justify-between gap-3">
                <Link href={`/invoices/${id}`} className={secondaryButton}>
                    Back to invoice
                </Link>
                <button type="button" onClick={() => window.print()} className={primaryButton}>
                    Print / Save as PDF
                </button>
            </div>

            {/* The document */}
            <article className="mx-auto max-w-3xl border border-black/20 bg-white p-10 text-[13px] leading-relaxed text-black">
                {/* Who it's from / document title */}
                <div className="flex items-start justify-between gap-8">
                    <div>
                        <p className="text-lg font-semibold">{workspace?.name ?? "SimpleBooks"}</p>
                        <div className="mt-2 text-[12px] text-black/70">
                            {workspace?.address && <p className="whitespace-pre-line">{workspace.address}</p>}
                            {workspace?.email && <p>{workspace.email}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold tracking-tight">Invoice</p>
                        <p className="mt-1 font-mono text-[13px] text-black/70">{invoice.number}</p>
                    </div>
                </div>

                {/* Who it's for / dates */}
                <div className="mt-8 flex justify-between gap-8 border-t border-black/15 pt-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-black/60">Bill to</p>
                        <p className="mt-2 text-[15px] font-semibold">{invoice.client.name}</p>
                        <div className="mt-1 text-[12px] text-black/70">
                            {invoice.client.contactName && <p>Attn: {invoice.client.contactName}</p>}
                            {invoice.client.address && <p className="whitespace-pre-line">{invoice.client.address}</p>}
                            {invoice.client.email && <p>{invoice.client.email}</p>}
                        </div>
                    </div>
                    <dl className="grid shrink-0 grid-cols-[auto_auto] content-start gap-x-6 gap-y-1 text-[12px]">
                        <dt className="text-black/60">Issued</dt>
                        <dd className="text-right font-mono">{formatDate(invoice.issueDate)}</dd>
                        <dt className="text-black/60">Due</dt>
                        <dd className="text-right font-mono">{formatDate(invoice.dueDate)}</dd>
                    </dl>
                </div>

                {/* Line items */}
                <table className="mt-8 w-full text-left">
                    <thead>
                        <tr className="border-b border-black/40 text-[11px] font-semibold uppercase tracking-wider">
                            <th className="pb-2">Description</th>
                            <th className="pb-2 text-right">Qty</th>
                            <th className="pb-2 text-right">Rate</th>
                            <th className="pb-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id} className="border-b border-black/10 align-top">
                                <td className="py-3 pr-4">
                                    <p>{item.description}</p>
                                    {item.subDescription && (
                                        <p className="mt-0.5 text-[12px] text-black/60">{item.subDescription}</p>
                                    )}
                                </td>
                                <td className="py-3 text-right font-mono">{Number(item.quantity).toLocaleString()}</td>
                                <td className="py-3 pl-4 text-right font-mono">{money(item.unitPrice)}</td>
                                <td className="py-3 pl-4 text-right font-mono">{money(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="mt-6 ml-auto w-full max-w-xs">
                    <dl className="space-y-1 text-[13px]">
                        <div className="flex justify-between">
                            <dt className="text-black/60">Subtotal</dt>
                            <dd className="font-mono">{money(invoice.subtotal)}</dd>
                        </div>
                        {hasDiscount && (
                            <div className="flex justify-between">
                                <dt className="text-black/60">Discount</dt>
                                <dd className="font-mono">-{money(invoice.discount)}</dd>
                            </div>
                        )}
                        {hasTax && (
                            <div className="flex justify-between">
                                <dt className="text-black/60">Tax ({Number(invoice.taxRate)}%)</dt>
                                <dd className="font-mono">{money(invoice.tax)}</dd>
                            </div>
                        )}
                        <div className="mt-2 flex justify-between border-t border-black/40 pt-2 text-[15px] font-semibold">
                            <dt>Total</dt>
                            <dd className="font-mono">{money(invoice.total)}</dd>
                        </div>
                    </dl>
                </div>

                {/* Payments */}
                {payments.length > 0 && (
                    <div className="mt-8 border-t border-black/15 pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-black/60">
                            Payments received
                        </p>
                        <dl className="mt-3 space-y-1 text-[12px]">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex justify-between">
                                    <dt className="text-black/60">{formatDate(payment.date)}</dt>
                                    <dd className="font-mono">{money(payment.amount)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}

                {/* Footer */}
                {invoice.notesToClient && (
                    <div className="mt-8 border-t border-black/15 pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-black/60">Notes</p>
                        <p className="mt-2 whitespace-pre-line text-[12px] text-black/80">{invoice.notesToClient}</p>
                    </div>
                )}
            </article>
        </div>
    );
}
