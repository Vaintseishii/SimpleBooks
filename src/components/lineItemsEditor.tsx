"use client";

import { Plus, X } from "lucide-react";
import { errorClass, fieldClass, smallFieldClass } from "./fieldStyles";
import { emptyLineItem, lineAmount, plainMoney, toNumber, type LineItemDraft } from "~/lib/invoiceDraft";

type LineItemsEditorProps = {
    items: LineItemDraft[];
    error?: string;
    onChange: (items: LineItemDraft[]) => void;
};

// Only digits, commas and one decimal point
const cleanNumber = (value: string) => value.replace(/[^\d.,]/g, "");

const columns = "grid grid-cols-[minmax(0,1fr)_64px_112px_96px_32px] items-start gap-3";

const numberField =
    "h-11 w-full rounded-md border border-border-default bg-surface px-3 text-right font-mono text-num-m text-fg-primary placeholder:text-fg-tertiary transition-colors duration-120 ease-out hover:border-border-strong focus:border-border-accent focus:outline-none";

export function LineItemsEditor({ items, error, onChange }: LineItemsEditorProps) {
    function updateItem(key: string, patch: Partial<LineItemDraft>) {
        onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
    }

    function removeItem(key: string) {
        onChange(items.length === 1 ? [emptyLineItem()] : items.filter((item) => item.key !== key));
    }

    // Tidy the rate into 1,200.00 when the field loses focus
    function formatRate(item: LineItemDraft) {
        if (item.unitPrice.trim() === "") return;
        updateItem(item.key, { unitPrice: plainMoney.format(toNumber(item.unitPrice)) });
    }

    return (
        <div>
            <div className={`${columns} pb-3 text-overline uppercase text-fg-tertiary`}>
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
                <span />
            </div>

            <ul className="flex flex-col gap-4">
                {items.map((item, index) => (
                    <li key={item.key} className={columns}>
                        <div className="flex flex-col gap-2">
                            <input
                                aria-label={`Line ${index + 1} description`}
                                value={item.description}
                                onChange={(e) => updateItem(item.key, { description: e.target.value })}
                                placeholder="What did you do?"
                                className={fieldClass()}
                            />
                            <input
                                aria-label={`Line ${index + 1} detail`}
                                value={item.subDescription}
                                onChange={(e) => updateItem(item.key, { subDescription: e.target.value })}
                                placeholder="Add a detail (optional)"
                                className={smallFieldClass()}
                            />
                        </div>
                        <input
                            aria-label={`Line ${index + 1} quantity`}
                            inputMode="decimal"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.key, { quantity: cleanNumber(e.target.value) })}
                            className={`${numberField} text-center`}
                        />
                        <input
                            aria-label={`Line ${index + 1} rate`}
                            inputMode="decimal"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.key, { unitPrice: cleanNumber(e.target.value) })}
                            onBlur={() => formatRate(item)}
                            placeholder="0.00"
                            className={numberField}
                        />
                        <span className="flex h-11 items-center justify-end font-mono text-num-m text-fg-primary">
                            {plainMoney.format(lineAmount(item))}
                        </span>
                        <button
                            type="button"
                            aria-label={`Remove line ${index + 1}`}
                            onClick={() => removeItem(item.key)}
                            className="mt-1.5 flex size-8 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                        >
                            <X className="size-4" />
                        </button>
                    </li>
                ))}
            </ul>

            {error && <p className={errorClass}>{error}</p>}

            <button
                type="button"
                onClick={() => onChange([...items, emptyLineItem()])}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md px-3 text-label-m text-fg-accent transition-colors duration-120 ease-out hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                <Plus className="size-4" /> Add line item
            </button>
        </div>
    );
}