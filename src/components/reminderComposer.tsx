"use client";

import { useState } from "react";
import NextLink from "next/link";
import { ArrowRight, Check, History, Pencil, Send, X } from "lucide-react";
import { primaryButton } from "./buttonStyles";
import { errorClass, fieldClass, labelClass } from "./fieldStyles";
import { usd } from "~/lib/format";
import { dueLabel, invoiceLinkToken, reminderTemplate, type Balance } from "~/lib/receivables";
import type { ClientOption } from "~/lib/sampleBilling";

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export type ReminderInput = { invoiceId: string; to: string; subject: string; body: string };

type ReminderComposerProps = {
    balance: Balance;
    contact: ClientOption | undefined;
    sender: string;
    lastSentAt: Date | null;
    onSend: (input: ReminderInput) => void;
    onClose: () => void;
};

// Give it key={balance.invoice.id} so the message resets when you pick another invoice
export function ReminderComposer({ balance, contact, sender, lastSentAt, onSend, onClose }: ReminderComposerProps) {
    const [message, setMessage] = useState(() => reminderTemplate(balance, contact?.contactName ?? null, sender));
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { invoice } = balance;
    const email = contact?.email ?? null;
    const toLine = [contact?.contactName, email].filter(Boolean).join(" · ");

    function send() {
        if (!email) return setError("This client has no email address yet. Add one on the client first.");
        if (!message.subject.trim() || !message.body.trim()) return setError("Add a subject and a message before sending.");
        setError(null);
        setEditing(false);
        onSend({ invoiceId: invoice.id, to: email, subject: message.subject.trim(), body: message.body.trim() });
    }

    return (
        <section aria-labelledby="reminder-title" className="rounded-lg border border-border-default bg-surface p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
                <h2 id="reminder-title" className="text-title-section">A friendly follow-up</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    <X className="size-5" />
                </button>
            </div>

            {/* the invoice being chased */}
            <div className={`mt-6 rounded-md p-5 ${balance.overdue ? "bg-status-overdue" : "bg-accent-soft"}`}>
                <div className="flex items-baseline justify-between gap-4">
                    <p className="text-body-m text-fg-primary">{invoice.client.name}</p>
                    <p className={`font-mono text-num-s ${balance.overdue ? "text-status-overdue-fg" : "text-fg-secondary"}`}>
                        {invoice.number}
                    </p>
                </div>
                <p className="mt-3 font-mono text-num-hero text-fg-primary">{usd.format(balance.amount)}</p>
                <p className={`mt-3 text-body-s ${balance.overdue ? "text-status-overdue-fg" : "text-fg-secondary"}`}>
                    Due {shortDate.format(invoice.dueDate)} · {dueLabel(balance).toLowerCase()}
                </p>
            </div>

            <div className="mt-6 border-b border-border-subtle pb-5">
                <p className="text-overline uppercase text-fg-tertiary">To</p>
                <p className="mt-2 text-body-m text-fg-primary">{toLine || "No contact on file"}</p>
            </div>

            {editing ? (
                <div className="mt-5 flex flex-col gap-5">
                    <div>
                        <label htmlFor="reminder-subject" className={labelClass}>Subject</label>
                        <input
                            id="reminder-subject"
                            value={message.subject}
                            onChange={(e) => setMessage((m) => ({ ...m, subject: e.target.value }))}
                            className={fieldClass()}
                        />
                    </div>
                    <div>
                        <label htmlFor="reminder-body" className={labelClass}>Message</label>
                        <textarea
                            id="reminder-body"
                            rows={16}
                            value={message.body}
                            onChange={(e) => setMessage((m) => ({ ...m, body: e.target.value }))}
                            className={`${fieldClass()} h-auto py-3 leading-6`}
                        />
                        <p className="mt-2 text-caption text-fg-tertiary">
                            Keep {invoiceLinkToken} on its own line where the invoice link should go.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-5">
                        <p className="text-overline uppercase text-fg-tertiary">Subject</p>
                        <p className="mt-2 text-body-m text-fg-primary">{message.subject}</p>
                    </div>
                    <div className="mt-5 flex flex-col gap-4 rounded-md border border-border-default bg-sunken p-5 text-body-m text-fg-primary">
                        {message.body.split(/\n{2,}/).map((paragraph, i) =>
                            paragraph.trim() === invoiceLinkToken ? (
                                <NextLink
                                    key={i}
                                    href="/invoices"
                                    className="inline-flex w-fit items-center gap-1 rounded-sm text-fg-accent hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-border-focus"
                                >
                                    View invoice <ArrowRight className="size-4" />
                                </NextLink>
                            ) : (
                                <p key={i} className="whitespace-pre-line">{paragraph}</p>
                            ),
                        )}
                    </div>
                </>
            )}

            <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="mt-5 inline-flex items-center gap-2 rounded-sm text-label-m text-fg-accent hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
                {editing ? "Done editing" : "Edit message"}
            </button>

            <p className="mt-5 flex items-center gap-2 text-caption text-fg-tertiary">
                <History className="size-4" />
                {lastSentAt ? `Last reminder sent ${longDate.format(lastSentAt)}` : "No reminders sent yet"}
            </p>

            {error && <p role="alert" className={errorClass}>{error}</p>}

            <button type="button" onClick={send} className={`${primaryButton} mt-5`}>
                <Send className="size-4" /> Send reminder
            </button>
        </section>
    );
}