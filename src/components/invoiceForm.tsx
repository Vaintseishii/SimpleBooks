"use client";

import { useState } from "react";
import NextLink from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronDown, Eye, Mail } from "lucide-react";
import { StatusPill } from "./statusPill";
import { LineItemsEditor } from "./lineItemsEditor";
import { InvoicePreview } from "./invoicePreview";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { cardClass, errorClass, fieldClass, labelClass } from "./fieldStyles";
import { usd } from "~/lib/format";
import {
    createDraft,
    getTotals,
    nextInvoiceNumber,
    toInvoiceInput,
    validateDraft,
    type DraftErrors,
    type InvoiceDraft,
} from "~/lib/invoiceDraft";
import type { InvoiceStatus } from "~/lib/sampleInvoices";
import type { ClientOption, WorkspaceInfo } from "~/lib/sampleBilling";
import type { InvoiceInput } from "~/lib/invoiceDraft";

type InvoiceFormProps = {
    clients: ClientOption[];
    workspace: WorkspaceInfo;
    existingNumbers: string[];
    today: Date;
    onSave: (input: InvoiceInput) => Promise<unknown>;
    isSaving: boolean;
};

const selectIcon = "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg-secondary";

export function InvoiceForm({
    clients,
    workspace,
    existingNumbers,
    today,
    onSave,
    isSaving,
}: InvoiceFormProps) {
    const [draft, setDraft] = useState<InvoiceDraft>(() =>
        createDraft({
            today,
            number: nextInvoiceNumber(existingNumbers),
        }),
    );
    const [errors, setErrors] = useState<DraftErrors>({});
    const [saved, setSaved] = useState<{ status: InvoiceStatus; number: string } | null>(null);

    const totals = getTotals(draft);
    const client = clients.find((c) => c.id === draft.clientId);

    function update<K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) {
        setDraft((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
        setSaved(null);
    }

    async function save(status: InvoiceStatus) {
        const found = validateDraft(draft, existingNumbers, status);
        setErrors(found);
        if (Object.values(found).some(Boolean)) {
            setSaved(null);
            return;
        }

        const input = toInvoiceInput(draft, status, workspace.currency, new Date());
        try {
            await onSave(input);
            setSaved({ status, number: input.number });
        } catch (err) {
            // Error handled by the mutation
            console.error("Failed to save invoice:", err);
            setSaved(null);
        }
    }

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                void save("SENT");
            }}
            className="flex flex-col gap-8"
        >
            {/* page header */}
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-overline uppercase text-fg-tertiary">Good work deserves a good invoice</p>
                    <h1 className="mt-2 text-display-page">New invoice</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        Add the details, make it yours, and send when you&apos;re ready.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <button
                        type="button"
                        onClick={() => save("DRAFT")}
                        className={secondaryButton}
                        disabled={isSaving}
                    >
                        Save draft
                    </button>
                    <button type="submit" className={primaryButton} disabled={isSaving}>
                        <ArrowUpRight className="size-4" /> Send invoice
                    </button>
                </div>
            </div>

            {saved && (
                <div role="status" className="flex items-start gap-3 rounded-lg border border-border-default bg-accent-soft p-4 text-body-m text-fg-primary">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fg-accent" />
                    <p>
                        {saved.status === "SENT"
                            ? `${saved.number} is ready to go to ${client?.email ?? client?.name ?? "your client"}.`
                            : `${saved.number} is saved as a draft.`}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-12 items-start gap-6">
                {/* left: the form */}
                <div className="col-span-7 flex flex-col gap-6">
                    <section className={cardClass}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-title-card">Invoice details</h2>
                            <StatusPill status={saved?.status === "SENT" ? "sent" : "draft"} />
                        </div>

                        <div className="mt-6">
                            <label htmlFor="clientId" className={labelClass}>Bill to</label>
                            <div className="relative">
                                <select
                                    id="clientId"
                                    value={draft.clientId}
                                    onChange={(e) => update("clientId", e.target.value)}
                                    aria-invalid={Boolean(errors.clientId)}
                                    className={`${fieldClass(Boolean(errors.clientId))} appearance-none pr-10`}
                                >
                                    <option value="" disabled>Choose a client</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className={selectIcon} />
                            </div>
                            {errors.clientId && <p className={errorClass}>{errors.clientId}</p>}
                            {client && (
                                <p className="mt-3 flex items-center gap-2 text-body-s text-fg-secondary">
                                    <Mail className="size-4 text-fg-tertiary" />
                                    {client.email ?? "No email on file"}
                                    <NextLink href="/clients" className="rounded-xs text-label-m text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-border-focus">
                                        Edit client
                                    </NextLink>
                                </p>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="number" className={labelClass}>Invoice number</label>
                                <input
                                    id="number"
                                    value={draft.number}
                                    onChange={(e) => update("number", e.target.value)}
                                    aria-invalid={Boolean(errors.number)}
                                    className={`${fieldClass(Boolean(errors.number))} font-mono`}
                                />
                                {errors.number && <p className={errorClass}>{errors.number}</p>}
                            </div>
                            <div>
                                <label htmlFor="issueDate" className={labelClass}>Issue date</label>
                                <input
                                    id="issueDate"
                                    type="date"
                                    value={draft.issueDate}
                                    onChange={(e) => update("issueDate", e.target.value)}
                                    aria-invalid={Boolean(errors.issueDate)}
                                    className={fieldClass(Boolean(errors.issueDate))}
                                />
                                {errors.issueDate && <p className={errorClass}>{errors.issueDate}</p>}
                            </div>
                            <div>
                                <label htmlFor="dueDate" className={labelClass}>Due date</label>
                                <input
                                    id="dueDate"
                                    type="date"
                                    value={draft.dueDate}
                                    min={draft.issueDate}
                                    onChange={(e) => update("dueDate", e.target.value)}
                                    aria-invalid={Boolean(errors.dueDate)}
                                    className={fieldClass(Boolean(errors.dueDate))}
                                />
                                {errors.dueDate && <p className={errorClass}>{errors.dueDate}</p>}
                            </div>
                        </div>
                    </section>

                    <section className={cardClass}>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-title-card">What are you billing for?</h2>
                            <span className="text-caption text-fg-tertiary">Currency: {workspace.currency}</span>
                        </div>

                        <LineItemsEditor items={draft.items} error={errors.items} onChange={(items) => update("items", items)} />

                        <div className="mt-6 flex items-center justify-end border-t border-border-subtle pt-6">
                            <p className="flex items-baseline gap-4">
                                <span className="text-body-m text-fg-secondary">Total</span>
                                <span className="font-mono text-num-l">{usd.format(totals.total)}</span>
                            </p>
                        </div>
                    </section>
                </div>

                {/* right: live preview */}
                <aside className="sticky top-8 col-span-5">
                    <p className="mb-4 flex items-center gap-2 text-label-m text-fg-primary">
                        <Eye className="size-4 text-fg-secondary" /> Live preview
                    </p>
                    <InvoicePreview
                        draft={draft}
                        totals={totals}
                        client={client}
                        workspace={workspace}
                    />
                </aside>
            </div>
        </form>
    );
}