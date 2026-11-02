"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { errorClass, fieldClass, labelClass } from "./fieldStyles";
import { usd } from "~/lib/format";
import { fromDateInput, toDateInput } from "~/lib/expenseDraft";
import { dueLabel, type Balance } from "~/lib/receivables";

// What goes to the invoice router: a full payment marks the invoice PAID on paidAt
export type PaymentInput = { invoiceId: string; amount: number; paidAt: Date };

type Errors = Partial<Record<"invoiceId" | "date", string>>;

const selectIcon = "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg-secondary";

type RecordPaymentFormProps = {
    balances: Balance[];
    initialInvoiceId: string | null;
    today: Date;
    onSave: (input: PaymentInput) => void;
    onClose: () => void;
};

export function RecordPaymentForm({ balances, initialInvoiceId, today, onSave, onClose }: RecordPaymentFormProps) {
    const [invoiceId, setInvoiceId] = useState(initialInvoiceId ?? "");
    const [date, setDate] = useState(toDateInput(today));
    const [errors, setErrors] = useState<Errors>({});

    const selected = balances.find((b) => b.invoice.id === invoiceId);

    function save() {
        const found: Errors = {};
        const paidAt = fromDateInput(date);
        if (!selected) found.invoiceId = "Pick the invoice this payment is for.";
        if (!paidAt) found.date = "Enter the date the money arrived.";
        else if (paidAt > today) found.date = "That date is in the future. Record payments once they arrive.";
        else if (selected && paidAt < selected.invoice.issueDate) found.date = "That’s before the invoice was issued.";
        setErrors(found);
        if (!selected || !paidAt || Object.values(found).some(Boolean)) return;

        onSave({ invoiceId: selected.invoice.id, amount: selected.amount, paidAt });
    }

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                save();
            }}
            className="rounded-lg border border-border-default bg-surface p-6 shadow-card"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-title-section">Record a payment</h2>
                    <p className="mt-2 text-caption text-fg-tertiary">The invoice is marked paid and leaves this list.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    <X className="size-5" />
                </button>
            </div>

            <div className="mt-6">
                <label htmlFor="payment-invoice" className={labelClass}>Invoice</label>
                <div className="relative">
                    <select
                        id="payment-invoice"
                        value={invoiceId}
                        onChange={(e) => {
                            setInvoiceId(e.target.value);
                            setErrors((prev) => ({ ...prev, invoiceId: undefined }));
                        }}
                        aria-invalid={Boolean(errors.invoiceId)}
                        className={`${fieldClass(Boolean(errors.invoiceId))} appearance-none pr-10`}
                    >
                        <option value="" disabled>Choose an outstanding invoice</option>
                        {balances.map((b) => (
                            <option key={b.invoice.id} value={b.invoice.id}>
                                {b.invoice.number} · {b.invoice.client.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className={selectIcon} />
                </div>
                {errors.invoiceId && <p className={errorClass}>{errors.invoiceId}</p>}
            </div>

            {selected && (
                <div className="mt-4 flex items-baseline justify-between gap-4 rounded-md bg-sunken p-4">
                    <div>
                        <p className="text-body-s text-fg-secondary">{selected.invoice.projectTitle}</p>
                        <p className={`text-caption ${selected.overdue ? "text-status-overdue-fg" : "text-fg-tertiary"}`}>
                            {dueLabel(selected)}
                        </p>
                    </div>
                    <p className="font-mono text-num-l text-fg-primary">{usd.format(selected.amount)}</p>
                </div>
            )}

            <div className="mt-6">
                <label htmlFor="payment-date" className={labelClass}>Date received</label>
                <input
                    id="payment-date"
                    type="date"
                    value={date}
                    max={toDateInput(today)}
                    onChange={(e) => {
                        setDate(e.target.value);
                        setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                    aria-invalid={Boolean(errors.date)}
                    className={fieldClass(Boolean(errors.date))}
                />
                {errors.date && <p className={errorClass}>{errors.date}</p>}
            </div>

            <p className="mt-6 text-caption text-fg-tertiary">
                Payments are recorded for the full balance. Partial payments come later.
            </p>

            <div className="mt-6 flex gap-3">
                <button type="submit" className={primaryButton}>
                    Record {selected ? usd.format(selected.amount) : "payment"}
                </button>
                <button type="button" onClick={onClose} className={secondaryButton}>
                    Cancel
                </button>
            </div>
        </form>
    );
}