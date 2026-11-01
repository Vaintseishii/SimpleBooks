"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
    ArrowUpRight,
    CheckCircle2,
    CircleDollarSign,
    Edit,
    Eye,
    Mail,
    MoreHorizontal,
    Send,
    Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { StatusPill } from "./statusPill";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { cardClass } from "./fieldStyles";
import { usd } from "~/lib/format";
import { shortDate, getDisplayStatus } from "~/lib/invoiceStatus";
import type { RouterOutputs } from "~/trpc/react";

type InvoiceWithRelations = RouterOutputs["invoices"]["byId"];

function formatDate(date: Date | string | null | undefined) {
    if (!date) return "—";
    return shortDate.format(new Date(date));
}

export function InvoiceDetail({
    invoice,
    onClose,
}: {
    invoice: InvoiceWithRelations;
    onClose: () => void;
}) {
    const router = useRouter();
    const utils = api.useUtils();

    const [showActions, setShowActions] = useState(false);
    const [showRecordPayment, setShowRecordPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

    const displayStatus = getDisplayStatus(invoice, new Date());
    const totalPaid = invoice.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
    const balance = Number(invoice.total) - totalPaid;

    const updateInvoice = api.invoices.update.useMutation({
        onSuccess: async () => {
            await utils.invoices.list.invalidate();
            await utils.invoices.byId.invalidate({ id: invoice.id });
        },
    });

    const deleteInvoice = api.invoices.delete.useMutation({
        onSuccess: async () => {
            await utils.invoices.list.invalidate();
            onClose();
        },
    });

    const createPayment = api.invoices.createPayment.useMutation({
        onSuccess: async () => {
            await utils.invoices.list.invalidate();
            await utils.invoices.byId.invalidate({ id: invoice.id });
            setShowRecordPayment(false);
            setPaymentAmount("");
        },
    });

    function handleRecordPayment() {
        const amount = Number(paymentAmount);
        if (!amount || amount <= 0 || amount > balance) return;

        createPayment.mutate({
            invoiceId: invoice.id,
            amount,
            date: paymentDate ? new Date(paymentDate) : new Date(),
        });
    }

    function handleSendReminder() {
        // TODO: Implement reminder sending
        console.log("Send reminder for", invoice.number);
        setShowActions(false);
    }

    function handleMarkAsSent() {
        updateInvoice.mutate({ id: invoice.id, status: "SENT" });
        setShowActions(false);
    }

    function handleMarkAsDraft() {
        updateInvoice.mutate({ id: invoice.id, status: "DRAFT" });
        setShowActions(false);
    }

    function handleDelete() {
        if (window.confirm(`Delete ${invoice.number}? This cannot be undone.`)) {
            deleteInvoice.mutate({ id: invoice.id });
        }
        setShowActions(false);
    }

    const isOverdue = displayStatus === "overdue";
    const isPaid = invoice.status === "PAID";
    const isDraft = invoice.status === "DRAFT";
    const canSend = isDraft;
    const canRecordPayment = !isPaid && balance > 0;

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-fg-tertiary hover:bg-sunken hover:text-fg-primary transition-colors focus-visible:outline-2 focus-visible:outline-border-focus"
                        aria-label="Back to invoices"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <StatusPill status={displayStatus} />
                        <h1 className="mt-2 text-display-page">{invoice.number}</h1>
                    </div>
                </div>

                <div className="flex shrink-0 gap-3">
                    <div className="relative" onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>
                        <button
                            className="rounded-lg p-2 text-fg-tertiary hover:bg-sunken hover:text-fg-primary transition-colors focus-visible:outline-2 focus-visible:outline-border-focus"
                            aria-label="More actions"
                        >
                            <MoreHorizontal className="size-5" />
                        </button>
                        {showActions && (
                            <div className="absolute right-0 top-full mt-1 rounded-lg border border-border-default bg-surface shadow-lg p-2 min-w-[180px] z-10">
                                <button
                                    onClick={handleSendReminder}
                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-label-m text-fg-primary hover:bg-sunken transition-colors"
                                >
                                    <Send className="size-4" /> Send reminder
                                </button>
                                {!isPaid && (
                                    <>
                                        {canSend && (
                                            <button
                                                onClick={handleMarkAsSent}
                                                className="flex w-full items-center gap-2 rounded px-3 py-2 text-label-m text-fg-primary hover:bg-sunken transition-colors"
                                            >
                                                <ArrowUpRight className="size-4" /> Mark as sent
                                            </button>
                                        )}
                                        {!isDraft && (
                                            <button
                                                onClick={handleMarkAsDraft}
                                                className="flex w-full items-center gap-2 rounded px-3 py-2 text-label-m text-fg-primary hover:bg-sunken transition-colors"
                                            >
                                                <CircleDollarSign className="size-4" /> Mark as draft
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-label-m text-fg-primary hover:bg-sunken transition-colors"
                                >
                                    <Edit className="size-4" /> Edit invoice
                                </button>
                                <hr className="my-1 border-border-subtle" />
                                <button
                                    onClick={handleDelete}
                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-label-m text-status-overdue-fg hover:bg-sunken transition-colors"
                                >
                                    <Trash2 className="size-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <NextLink href={`/invoices/${invoice.id}/edit`} className={secondaryButton}>
                        <Edit className="size-4 mr-2" /> Edit
                    </NextLink>

                    {canRecordPayment && (
                        <button onClick={() => setShowRecordPayment(true)} className={primaryButton}>
                            <CircleDollarSign className="size-4 mr-2" /> Record payment
                        </button>
                    )}

                    {isPaid && (
                        <button className={secondaryButton} disabled>
                            <CheckCircle2 className="size-4 mr-2" /> Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Record Payment Modal */}
            {showRecordPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className={cardClass + " w-full max-w-md"}>
                        <h2 className="text-title-card p-6 border-b border-border-subtle">Record Payment</h2>
                        <div className="p-6 space-y-4">
                            <p className="text-body-m text-fg-secondary">
                                Recording payment for <span className="font-mono">{invoice.number}</span>
                            </p>
                            <p className="text-body-m text-fg-secondary">
                                Balance due: <span className="font-mono text-num-l text-fg-primary">{usd.format(balance)}</span>
                            </p>

                            <div>
                                <label className="block text-label-m text-fg-primary mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={balance}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full rounded-md border border-border-default bg-sunken px-3 py-2 text-body-m text-fg-primary focus:border-border-accent focus:outline-none"
                                    placeholder={usd.format(balance)}
                                />
                            </div>

                            <div>
                                <label className="block text-label-m text-fg-primary mb-1">Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full rounded-md border border-border-default bg-sunken px-3 py-2 text-body-m text-fg-primary focus:border-border-accent focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowRecordPayment(false)} className={secondaryButton}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRecordPayment}
                                    className={primaryButton}
                                    disabled={createPayment.isPending || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > balance}
                                >
                                    {createPayment.isPending ? "Recording..." : `Record ${usd.format(Number(paymentAmount) || 0)}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Details Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Invoice Info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Client & Project */}
                    <section className={cardClass}>
                        <h2 className="text-title-card p-6 border-b border-border-subtle">Bill to</h2>
                        <div className="p-6">
                            <p className="text-body-l text-fg-primary">{invoice.client.name}</p>
                            {invoice.client.contactName && (
                                <p className="mt-1 text-body-m text-fg-secondary">{invoice.client.contactName}</p>
                            )}
                            {invoice.client.email && (
                                <p className="mt-1 flex items-center gap-2 text-body-m text-fg-secondary">
                                    <Mail className="size-4 text-fg-tertiary" />
                                    <a href={`mailto:${invoice.client.email}`} className="text-fg-accent hover:underline">
                                        {invoice.client.email}
                                    </a>
                                </p>
                            )}
                            {invoice.client.address && (
                                <p className="mt-1 whitespace-pre-wrap text-body-m text-fg-secondary">{invoice.client.address}</p>
                            )}
                            {invoice.projectTitle && (
                                <p className="mt-4 flex items-center gap-2 text-body-m text-fg-tertiary">
                                    <Eye className="size-4" /> Project: {invoice.projectTitle}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Dates */}
                    <section className={cardClass}>
                        <h2 className="text-title-card p-6 border-b border-border-subtle">Dates</h2>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-caption uppercase text-fg-tertiary">Issue date</p>
                                <p className="text-body-m text-fg-primary">{formatDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-caption uppercase text-fg-tertiary">Due date</p>
                                <p className={`text-body-m font-mono ${isOverdue ? "text-status-overdue-fg" : "text-fg-primary"}`}>
                                    {formatDate(invoice.dueDate)}
                                    {isOverdue && <span className="ml-2 text-body-s text-status-overdue-fg">(Overdue)</span>}
                                </p>
                            </div>
                            {invoice.sentAt && (
                                <div>
                                    <p className="text-caption uppercase text-fg-tertiary">Sent at</p>
                                    <p className="text-body-m text-fg-primary">{formatDate(invoice.sentAt)}</p>
                                </div>
                            )}
                            {invoice.paidAt && (
                                <div>
                                    <p className="text-caption uppercase text-fg-tertiary">Paid at</p>
                                    <p className="text-body-m text-fg-primary">{formatDate(invoice.paidAt)}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Line Items */}
                    <section className={cardClass}>
                        <h2 className="text-title-card p-6 border-b border-border-subtle">Line items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border-subtle text-left text-label-s text-fg-tertiary">
                                        <th className="p-4">Description</th>
                                        <th className="p-4 text-right">Qty</th>
                                        <th className="p-4 text-right">Unit price</th>
                                        <th className="p-4 text-right font-mono">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b border-border-subtle">
                                            <td className="p-4">
                                                <p className="text-body-m text-fg-primary">{item.description}</p>
                                                {item.subDescription && (
                                                    <p className="text-body-s text-fg-tertiary">{item.subDescription}</p>
                                                )}
                                            </td>
                                            <td className="p-4 text-right text-body-m text-fg-secondary">{Number(item.quantity).toLocaleString()}</td>
                                            <td className="p-4 text-right font-mono text-body-m text-fg-secondary">{usd.format(Number(item.unitPrice))}</td>
                                            <td className="p-4 text-right font-mono text-num-m text-fg-primary">{usd.format(Number(item.amount))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-border-default">
                                        <td colSpan={3} className="p-4 text-right text-body-m text-fg-secondary">Subtotal</td>
                                        <td className="p-4 text-right font-mono text-num-m text-fg-primary">{usd.format(Number(invoice.subtotal))}</td>
                                    </tr>
                                    {Number(invoice.discount) > 0 && (
                                        <tr className="border-t border-border-subtle">
                                            <td colSpan={3} className="p-4 text-right text-body-m text-fg-secondary">Discount</td>
                                            <td className="p-4 text-right font-mono text-num-m text-fg-secondary">-{usd.format(Number(invoice.discount))}</td>
                                        </tr>
                                    )}
                                    {Number(invoice.taxRate) > 0 && (
                                        <tr className="border-t border-border-subtle">
                                            <td colSpan={3} className="p-4 text-right text-body-m text-fg-secondary">
                                                Tax ({Number(invoice.taxRate)}%)
                                            </td>
                                            <td className="p-4 text-right font-mono text-num-m text-fg-secondary">{usd.format(Number(invoice.tax))}</td>
                                        </tr>
                                    )}
                                    <tr className="border-t border-border-default bg-sunken/50">
                                        <td colSpan={3} className="p-4 text-right text-title-card">Total</td>
                                        <td className="p-4 text-right font-mono text-num-l text-fg-primary">{usd.format(Number(invoice.total))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>

                    {/* Notes */}
                    {invoice.notesToClient && (
                        <section className={cardClass}>
                            <h2 className="text-title-card p-6 border-b border-border-subtle">Note to client</h2>
                            <div className="p-6 whitespace-pre-wrap text-body-m text-fg-secondary">{invoice.notesToClient}</div>
                        </section>
                    )}

                    {/* Payments */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <section className={cardClass}>
                            <h2 className="text-title-card p-6 border-b border-border-subtle">Payments received</h2>
                            <div className="p-6 space-y-4">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-sunken/50">
                                        <div>
                                            <p className="font-mono text-num-m text-fg-primary">{usd.format(Number(payment.amount))}</p>
                                            <p className="text-body-s text-fg-tertiary">{formatDate(payment.date)}</p>
                                        </div>
                                        <CircleDollarSign className="size-6 text-fg-tertiary" />
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                                    <span className="text-body-m text-fg-secondary">Total paid</span>
                                    <span className="font-mono text-num-l text-fg-primary">
                                        {usd.format(invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-body-m text-fg-secondary">Balance due</span>
                                    <span className={`font-mono text-num-l ${balance > 0 ? "text-fg-primary" : "text-status-paid-fg"}`}>
                                        {usd.format(balance)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Activity/History */}
                    <section className={cardClass}>
                        <h2 className="text-title-card p-6 border-b border-border-subtle">Activity</h2>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-body-m">
                                <span className="size-2 rounded-full bg-fg-tertiary" />
                                <span>Invoice created</span>
                                <span className="ml-auto text-fg-tertiary">{formatDate(invoice.createdAt)}</span>
                            </div>
                            {invoice.sentAt && (
                                <div className="flex items-center gap-3 text-body-m">
                                    <Send className="size-4 text-fg-accent" />
                                    <span>Invoice sent</span>
                                    <span className="ml-auto text-fg-tertiary">{formatDate(invoice.sentAt)}</span>
                                </div>
                            )}
                            {invoice.paidAt && (
                                <div className="flex items-center gap-3 text-body-m">
                                    <CheckCircle2 className="size-4 text-status-paid-fg" />
                                    <span>Payment received</span>
                                    <span className="ml-auto text-fg-tertiary">{formatDate(invoice.paidAt)}</span>
                                </div>
                            )}
                            {invoice.payments && invoice.payments.length > 0 && (
                                <div className="pt-4 border-t border-border-subtle">
                                    <p className="text-label-m text-fg-tertiary mb-2">Payments</p>
                                    <div className="space-y-2">
                                        {invoice.payments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between text-body-m">
                                                <span className="text-fg-secondary">{formatDate(payment.date)}</span>
                                                <span className="font-mono text-num-m text-fg-primary">{usd.format(Number(payment.amount))}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right: Summary */}
                <aside className="flex flex-col gap-6">
                    <section className={cardClass}>
                        <div className="p-6">
                            <p className="text-body-m text-fg-secondary">Status</p>
                            <p className="mt-1 text-title-card">
                                <StatusPill status={displayStatus} />
                            </p>
                        </div>
                    </section>

                    <section className={cardClass}>
                        <div className="p-6">
                            <p className="text-body-m text-fg-secondary">Amount</p>
                            <p className="mt-1 font-mono text-display-page text-fg-primary">{usd.format(Number(invoice.total))}</p>
                            {balance > 0 && (
                                <p className="mt-2 text-body-m text-fg-primary">Balance due: <span className="font-mono">{usd.format(balance)}</span></p>
                            )}
                        </div>
                    </section>

                    <section className={cardClass}>
                        <div className="p-6">
                            <p className="text-body-m text-fg-secondary">Payment method</p>
                            <p className="mt-1 text-body-m text-fg-primary">{invoice.paymentMethod ?? "—"}</p>
                        </div>
                    </section>

                    <section className={cardClass}>
                        <div className="p-6">
                            <p className="text-body-m text-fg-secondary">Currency</p>
                            <p className="mt-1 text-body-m text-fg-primary font-mono">{invoice.currency}</p>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}