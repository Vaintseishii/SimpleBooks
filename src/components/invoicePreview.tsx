import { Lock } from "lucide-react";
import { usd } from "~/lib/format";
import { shortDate } from "~/lib/invoiceStatus";
import {
    daysBetween,
    fromInputDate,
    isFilled,
    lineAmount,
    plainMoney,
    toNumber,
    type InvoiceDraft,
    type Totals,
} from "~/lib/invoiceDraft";
import type { ClientOption, PaymentMethod, WorkspaceInfo } from "~/lib/sampleBilling";

type InvoicePreviewProps = {
    draft: InvoiceDraft;
    totals: Totals;
    client: ClientOption | undefined;
    paymentMethod: PaymentMethod | undefined;
    workspace: WorkspaceInfo;
};

const formatQty = (value: string) => {
    const n = toNumber(value);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const formatRate = (n: number) => `${n.toFixed(n % 1 === 0 ? 0 : 2)}%`;

export function InvoicePreview({ draft, totals, client, paymentMethod, workspace }: InvoicePreviewProps) {
    const issue = fromInputDate(draft.issueDate);
    const due = fromInputDate(draft.dueDate);
    const terms = issue && due && due >= issue ? daysBetween(issue, due) : null;
    const items = draft.items.filter(isFilled);
    const number = draft.number.trim().toUpperCase() || "INV-—";

    return (
        <div>
            <div className="rounded-lg border border-border-default bg-surface p-8 text-fg-secondary shadow-card">
                {/* who it's from */}
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <span className="flex size-11 items-center justify-center rounded-md bg-accent text-title-section text-fg-on-accent">
                            {workspace.name.charAt(0)}.
                        </span>
                        <p className="mt-4 text-title-section text-fg-primary">{workspace.name}</p>
                        <div className="mt-2 text-caption">
                            {workspace.tagline && <p>{workspace.tagline}</p>}
                            {workspace.address && <p>{workspace.address}</p>}
                            {workspace.email && <p>{workspace.email}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-display-page text-fg-primary">Invoice</p>
                        <p className="mt-2 font-mono text-num-s text-fg-tertiary">{number}</p>
                    </div>
                </div>

                {/* who it's for */}
                <div className="mt-8 flex justify-between gap-6 border-t border-border-subtle pt-6">
                    <div className="min-w-0">
                        <p className="text-overline uppercase text-fg-primary">Bill to</p>
                        {client ? (
                            <>
                                <p className="mt-2 text-body-l text-fg-primary">{client.name}</p>
                                <div className="mt-1 text-caption">
                                    {client.contactName && <p>Attn: {client.contactName}</p>}
                                    {client.address && <p>{client.address}</p>}
                                    {client.email && <p>{client.email}</p>}
                                </div>
                            </>
                        ) : (
                            <p className="mt-2 text-body-m text-fg-tertiary">Choose a client to see it here.</p>
                        )}
                    </div>
                    <dl className="grid shrink-0 grid-cols-[auto_auto] content-start gap-x-8 gap-y-2 text-caption">
                        <dt>Issued</dt>
                        <dd className="text-right font-mono text-num-s text-fg-primary">{issue ? shortDate.format(issue) : "—"}</dd>
                        <dt>Due</dt>
                        <dd className="text-right font-mono text-num-s text-fg-primary">{due ? shortDate.format(due) : "—"}</dd>
                        {terms !== null && (
                            <dd className="col-span-2 text-right">
                                Payment terms: {terms === 0 ? "Due on receipt" : `Net ${terms}`}
                            </dd>
                        )}
                    </dl>
                </div>

                {/* line items */}
                <table className="mt-8 w-full text-left">
                    <thead>
                        <tr className="border-b border-accent text-overline uppercase text-fg-primary">
                            <th className="pb-3 font-semibold">Description</th>
                            <th className="pb-3 text-right font-semibold">Qty</th>
                            <th className="pb-3 text-right font-semibold">Rate</th>
                            <th className="pb-3 text-right font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-6 text-body-s text-fg-tertiary">
                                    Your line items will show up here.
                                </td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.key} className="border-b border-border-subtle align-top">
                                <td className="py-4 pr-4">
                                    <p className="text-body-m text-fg-primary">{item.description || "Untitled item"}</p>
                                    {item.subDescription && <p className="mt-1 text-caption">{item.subDescription}</p>}
                                </td>
                                <td className="py-4 text-right font-mono text-num-s">{formatQty(item.quantity)}</td>
                                <td className="py-4 pl-4 text-right font-mono text-num-s">{plainMoney.format(toNumber(item.unitPrice))}</td>
                                <td className="py-4 pl-4 text-right font-mono text-num-s text-fg-primary">{plainMoney.format(lineAmount(item))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* totals */}
                <dl className="mt-6 flex flex-col gap-3 text-body-m">
                    <div className="flex justify-between">
                        <dt>Subtotal</dt>
                        <dd className="font-mono text-num-m text-fg-primary">{usd.format(totals.subtotal)}</dd>
                    </div>
                    {totals.discount > 0 && (
                        <div className="flex justify-between">
                            <dt>Discount</dt>
                            <dd className="font-mono text-num-m text-fg-primary">−{usd.format(totals.discount)}</dd>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <dt>Tax ({formatRate(totals.taxRate)})</dt>
                        <dd className="font-mono text-num-m text-fg-primary">{usd.format(totals.tax)}</dd>
                    </div>
                </dl>
                <div className="mt-4 flex items-center justify-between rounded-md bg-accent-soft px-5 py-4">
                    <span className="text-body-m text-fg-primary">Total due · {workspace.currency}</span>
                    <span className="font-mono text-num-l text-fg-accent">{usd.format(totals.total)}</span>
                </div>

                {/* how to pay */}
                {paymentMethod && (
                    <div className="mt-8 text-caption">
                        <p className="text-overline uppercase text-fg-primary">{paymentMethod.title}</p>
                        <p className="mt-2">{paymentMethod.detail}</p>
                        <p>Please include {number} as your payment reference.</p>
                    </div>
                )}

                {draft.notesToClient.trim() && (
                    <p className="mt-6 whitespace-pre-line text-caption">{draft.notesToClient.trim()}</p>
                )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-caption text-fg-tertiary">
                <Lock className="size-3.5" /> Only sent to your client when you’re ready.
            </p>
        </div>
    );
}