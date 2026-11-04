"use client";

import { useEffect, useState } from "react";

import { Check } from "lucide-react";

import { primaryButton } from "~/components/buttonStyles";
import { CurrencyIcon } from "~/components/currencyIcon";
import { fieldClass, labelClass } from "~/components/fieldStyles";
import { api } from "~/trpc/react";
import { CURRENCIES, toCurrencyCode, type CurrencyCode } from "~/lib/currencies";

export function ProfileView() {
    const utils = api.useUtils();
    const workspace = api.workspace.get.useQuery();
    const [currency, setCurrency] = useState<CurrencyCode>("USD");
    const [saved, setSaved] = useState(false);

    // The query resolves after the first render; adopt whatever is stored.
    useEffect(() => {
        if (workspace.data) setCurrency(toCurrencyCode(workspace.data.currency));
    }, [workspace.data]);

    const save = api.workspace.updateCurrency.useMutation({
        onSuccess: async (data) => {
            setSaved(true);
            await utils.workspace.get.invalidate();
            setCurrency(toCurrencyCode(data.currency));
        },
    });

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="text-overline uppercase text-fg-tertiary">Workspace</p>
                <h1 className="mt-2 text-display-page">Profile</h1>
                <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                    Choose the currency new invoices default to. Existing invoices and
                    expenses keep the currency they were saved with.
                </p>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setSaved(false);
                    save.mutate({ currency });
                }}
                className="flex max-w-md flex-col gap-5 rounded-lg border border-border-default bg-surface p-6 shadow-card"
            >
                <label className="block">
                    <span className={labelClass}>Currency</span>
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-fg-accent">
                            <CurrencyIcon code={currency} className="size-4" />
                        </span>
                        <select
                            value={currency}
                            onChange={(event) => {
                                setSaved(false);
                                setCurrency(event.target.value as CurrencyCode);
                            }}
                            className={`${fieldClass()} appearance-none pr-10 pl-10`}
                        >
                            {CURRENCIES.map((option) => (
                                <option key={option.code} value={option.code}>
                                    {option.code} — {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={save.isPending}
                        className={`${primaryButton} h-10 justify-center disabled:opacity-60`}
                    >
                        {save.isPending ? "Saving…" : "Save currency"}
                    </button>
                    {saved && !save.isPending && (
                        <span className="text-body-s flex items-center gap-1.5 text-fg-secondary">
                            <Check className="size-4" /> Saved
                        </span>
                    )}
                </div>

                {save.error && (
                    <p role="alert" className="text-body-s text-status-overdue-fg">
                        {save.error.message}
                    </p>
                )}
            </form>
        </div>
    );
}
