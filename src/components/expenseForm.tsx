"use client";

import { useState } from "react";
import { Check, ChevronDown, FileText, Trash2, Upload, X } from "lucide-react";
import { primaryButton, secondaryButton } from "./buttonStyles";
import { errorClass, fieldClass, labelClass } from "./fieldStyles";
import {
    createExpenseDraft,
    findVendor,
    toExpenseInput,
    validateExpenseDraft,
    type ExpenseDraft,
    type ExpenseDraftErrors,
    type ExpenseInput,
} from "~/lib/expenseDraft";
import { categoryLabels, categoryOrder } from "~/lib/expenseSummary";
import type { ExpenseCategory, ExpenseStatus, PaymentAccount, Vendor } from "~/lib/sampleExpenses";

type ExpenseFormProps = {
    vendors: Vendor[];
    paymentAccounts: PaymentAccount[];
    today: Date;
    onSave: (input: ExpenseInput) => void;
    onClose: () => void;
};

const selectIcon = "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg-secondary";
const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

const statusOptions: { value: ExpenseStatus; label: string }[] = [
    { value: "PAID", label: "Paid" },
    { value: "UNPAID", label: "Unpaid bill" },
];

export function ExpenseForm({ vendors, paymentAccounts, today, onSave, onClose }: ExpenseFormProps) {
    const [draft, setDraft] = useState<ExpenseDraft>(() => createExpenseDraft(today, paymentAccounts[0]?.label ?? ""));
    const [errors, setErrors] = useState<ExpenseDraftErrors>({});

    const vendorName = draft.vendorName.trim();
    const isNewVendor = vendorName !== "" && !findVendor(vendors, vendorName);

    function update<K extends keyof ExpenseDraft>(key: K, value: ExpenseDraft[K]) {
        setDraft((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function save() {
        const found = validateExpenseDraft(draft);
        setErrors(found);
        if (Object.values(found).some(Boolean)) return;

        const input = toExpenseInput(draft, vendors);
        // TODO: swap for the real mutation once Joseph's expense router lands, e.g.
        // createExpense.mutate(input) with api.expense.create.useMutation()
        console.info("Expense ready to save", input);
        onSave(input);
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
                    <h2 className="text-title-section">Record an expense</h2>
                    <p className="mt-2 flex items-center gap-2 text-caption text-fg-tertiary">
                        <span className="size-1.5 rounded-full bg-chart-3" /> Not saved · excluded from your totals
                    </p>
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

            {/* receipt */}
            <div className="mt-6 rounded-md border border-border-default bg-sunken p-4">
                {draft.receipt ? (
                    <div className="flex items-center gap-3">
                        <FileText className="size-5 shrink-0 text-fg-secondary" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-label-m">{draft.receipt.name}</p>
                            <p className="text-caption text-fg-tertiary">{fileSize(draft.receipt.size)} · Receipt attached</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => update("receipt", null)}
                            aria-label="Remove receipt"
                            className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-surface hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm py-4 text-center focus-within:outline-2 focus-within:outline-border-focus">
                        <Upload className="size-5 text-fg-secondary" />
                        <span className="text-label-m text-fg-accent">Attach a receipt</span>
                        <span className="text-caption text-fg-tertiary">PDF, PNG or JPG. Optional, but future you will be glad.</span>
                        <input
                            type="file"
                            accept="application/pdf,image/png,image/jpeg"
                            className="sr-only"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) update("receipt", { name: file.name, size: file.size });
                            }}
                        />
                    </label>
                )}
            </div>

            {/* vendor: pick an existing one or type a new name */}
            <div className="mt-6">
                <label htmlFor="vendorName" className={labelClass}>Vendor</label>
                <input
                    id="vendorName"
                    list="vendor-options"
                    autoComplete="off"
                    value={draft.vendorName}
                    onChange={(e) => update("vendorName", e.target.value)}
                    placeholder="Choose or add a vendor"
                    aria-invalid={Boolean(errors.vendorName)}
                    aria-describedby="vendorName-hint"
                    className={fieldClass(Boolean(errors.vendorName))}
                />
                <datalist id="vendor-options">
                    {vendors.map((v) => (
                        <option key={v.id} value={v.name} />
                    ))}
                </datalist>
                {errors.vendorName ? (
                    <p className={errorClass}>{errors.vendorName}</p>
                ) : (
                    <p id="vendorName-hint" className="mt-2 text-caption text-fg-tertiary">
                        {isNewVendor ? `“${vendorName}” will be added as a new vendor.` : "Pick from your vendors, or type a new name."}
                    </p>
                )}
            </div>

            <div className="mt-6">
                <label htmlFor="description" className={labelClass}>What was it for?</label>
                <input
                    id="description"
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Monthly file storage"
                    aria-invalid={Boolean(errors.description)}
                    className={fieldClass(Boolean(errors.description))}
                />
                {errors.description && <p className={errorClass}>{errors.description}</p>}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className={labelClass}>Amount · USD</label>
                    <input
                        id="amount"
                        inputMode="decimal"
                        value={draft.amount}
                        onChange={(e) => update("amount", e.target.value)}
                        placeholder="0.00"
                        aria-invalid={Boolean(errors.amount)}
                        className={`${fieldClass(Boolean(errors.amount))} font-mono`}
                    />
                    {errors.amount && <p className={errorClass}>{errors.amount}</p>}
                </div>
                <div>
                    <label htmlFor="date" className={labelClass}>Date</label>
                    <input
                        id="date"
                        type="date"
                        value={draft.date}
                        onChange={(e) => update("date", e.target.value)}
                        aria-invalid={Boolean(errors.date)}
                        className={fieldClass(Boolean(errors.date))}
                    />
                    {errors.date && <p className={errorClass}>{errors.date}</p>}
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="category" className={labelClass}>Category</label>
                <div className="relative">
                    <select
                        id="category"
                        value={draft.category}
                        onChange={(e) => update("category", e.target.value as ExpenseCategory)}
                        className={`${fieldClass()} appearance-none pr-10`}
                    >
                        {categoryOrder.map((c) => (
                            <option key={c} value={c}>{categoryLabels[c]}</option>
                        ))}
                    </select>
                    <ChevronDown className={selectIcon} />
                </div>
            </div>

            {/* payment status */}
            <div className="mt-6">
                <p id="status-label" className={labelClass}>Payment status</p>
                <div role="radiogroup" aria-labelledby="status-label" className="grid grid-cols-2 gap-1 rounded-md border border-border-default bg-sunken p-1">
                    {statusOptions.map((option) => {
                        const active = draft.status === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => update("status", option.value)}
                                className={`h-9 rounded-sm text-label-m transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:outline-border-focus ${
                                    active ? "bg-surface text-fg-primary shadow-card" : "text-fg-secondary hover:text-fg-primary"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {draft.status === "PAID" ? (
                <div className="mt-6">
                    <label htmlFor="paidWith" className={labelClass}>Paid with</label>
                    <div className="relative">
                        <select
                            id="paidWith"
                            value={draft.paidWith}
                            onChange={(e) => update("paidWith", e.target.value)}
                            className={`${fieldClass()} appearance-none pr-10`}
                        >
                            {paymentAccounts.map((a) => (
                                <option key={a.id} value={a.label}>{a.label}</option>
                            ))}
                        </select>
                        <ChevronDown className={selectIcon} />
                    </div>
                </div>
            ) : (
                <p className="mt-4 rounded-md bg-status-unpaid px-4 py-3 text-body-s text-status-unpaid-fg">
                    This goes into your unpaid bills until you mark it paid.
                </p>
            )}

            <div className="mt-6">
                <label htmlFor="notes" className={labelClass}>Note (optional)</label>
                <input
                    id="notes"
                    value={draft.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Anything you want to remember"
                    className={fieldClass()}
                />
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6">
                <button type="button" onClick={onClose} className={secondaryButton}>
                    Cancel
                </button>
                <button type="submit" className={primaryButton}>
                    <Check className="size-4" /> Save expense
                </button>
            </div>
        </form>
    );
}