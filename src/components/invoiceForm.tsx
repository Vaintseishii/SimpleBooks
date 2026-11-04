"use client";

import { useState } from "react";
import NextLink from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronDown, Eye, Mail } from "lucide-react";
import { StatusPill } from "./statusPill";
import { LineItemsEditor } from "./lineItemsEditor";
import { InvoicePreview } from "./invoicePreview";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { cardClass, errorClass, fieldClass, labelClass } from "./fieldStyles";
import { CurrencyIcon } from "./currencyIcon";
import { formatMoney } from "~/lib/format";
import { CURRENCIES, toCurrencyCode, type CurrencyCode } from "~/lib/currencies";
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
    // Called when one of the business fields loses focus, so the workspace keeps
    // the details for the next invoice too.
    onBusinessChange?: (details: {
        name: string;
        address: string | null;
        email: string | null;
    }) => void;
};

const selectIcon = "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg-secondary";

export function InvoiceForm({
    clients,
    workspace,
    existingNumbers,
    today,
    onSave,
    isSaving,
    onBusinessChange,
}: InvoiceFormProps) {
    const [draft, setDraft] = useState<InvoiceDraft>(() =>
        createDraft({
            today,
            number: nextInvoiceNumber(existingNumbers),
        }),
    );
    const [errors, setErrors] = useState<DraftErrors>({});
    const [saved, setSaved] = useState<{ status: InvoiceStatus; number: string } | null>(null);
    // Starts on the workspace default; changing it here only affects this invoice.
    const [currency, setCurrency] = useState<CurrencyCode>(() =>
        toCurrencyCode(workspace.currency),
    );
    // Seeded from the workspace; edits are saved back so the next invoice keeps them.
    const [business, setBusiness] = useState({
        name: workspace.name,
        address: workspace.address ?? "",
        email: workspace.email ?? "",
    });

    function updateBusiness(key: keyof typeof business, value: string) {
        setBusiness((prev) => ({ ...prev, [key]: value }));
    }

    function saveBusiness() {
        onBusinessChange?.({
            name: business.name.trim() || workspace.name,
            address: business.address.trim() || null,
            email: business.email.trim() || null,
        });
    }

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

        const input = toInvoiceInput(draft, status, currency, new Date());
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

                        <div className="mt-6 border-t border-border-subtle pt-6">
                            <p className="text-overline uppercase text-fg-tertiary">Your business</p>
                            <div className="mt-4 flex flex-col gap-4">
                                <div>
                                    <label htmlFor="businessName" className={labelClass}>Business name</label>
                                    <input
                                        id="businessName"
                                        value={business.name}
                                        onChange={(e) => updateBusiness("name", e.target.value)}
                                        onBlur={saveBusiness}
                                        className={fieldClass()}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="businessEmail" className={labelClass}>Business email</label>
                                    <input
                                        id="businessEmail"
                                        type="email"
                                        value={business.email}
                                        onChange={(e) => updateBusiness("email", e.target.value)}
                                        onBlur={saveBusiness}
                                        placeholder="hello@yourbusiness.com"
                                        className={fieldClass()}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="businessAddress" className={labelClass}>Business address</label>
                                    <textarea
                                        id="businessAddress"
                                        value={business.address}
                                        onChange={(e) => updateBusiness("address", e.target.value)}
                                        onBlur={saveBusiness}
                                        rows={2}
                                        placeholder={"123 Design Street\nSan Francisco, CA 94102"}
                                        className="w-full resize-y rounded-md border border-border-default bg-surface px-4 py-3 text-body-l text-fg-primary placeholder:text-fg-tertiary transition-colors duration-120 ease-out hover:border-border-strong focus:border-border-accent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={cardClass}>
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 className="text-title-card">What are you billing for?</h2>
                            <label className="flex shrink-0 items-center gap-2">
                                <span className="text-caption text-fg-tertiary">Currency</span>
                                <span className="relative">
                                    <CurrencyIcon
                                        code={currency}
                                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-secondary"
                                    />
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                                        aria-label="Invoice currency"
                                        className={`${fieldClass()} appearance-none pr-10 pl-10`}
                                    >
                                        {CURRENCIES.map((option) => (
                                            <option key={option.code} value={option.code}>
                                                {option.code}
                                            </option>
                                        ))}
                                    </select>
                                </span>
                            </label>
                        </div>

                        <LineItemsEditor items={draft.items} error={errors.items} onChange={(items) => update("items", items)} />

                        <div className="mt-6 flex items-center justify-end border-t border-border-subtle pt-6">
                            <p className="flex items-baseline gap-4">
                                <span className="text-body-m text-fg-secondary">Total</span>
                                <span className="font-mono text-num-l">{formatMoney(totals.total, currency)}</span>
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
                        business={business}
                        currency={currency}
                    />
                </aside>
            </div>
        </form>
    );
}