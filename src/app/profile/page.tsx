"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Check } from "lucide-react";

import { primaryButton } from "~/components/buttonStyles";
import { CurrencyIcon } from "~/components/currencyIcon";
import { errorClass, fieldClass, labelClass } from "~/components/fieldStyles";
import { api } from "~/trpc/react";
import { CURRENCIES, toCurrencyCode, type CurrencyCode } from "~/lib/currencies";

export default function ProfilePage() {
    const router = useRouter();
    const utils = api.useUtils();

    const user = api.users.get.useQuery();
    const workspace = api.workspace.get.useQuery();

    const [name, setName] = useState({ firstName: "", lastName: "" });
    const [nameSaved, setNameSaved] = useState(false);

    const [currency, setCurrency] = useState<CurrencyCode>("USD");
    const [currencySaved, setCurrencySaved] = useState(false);

    // Queries resolve after the first render; adopt whatever is stored.
    useEffect(() => {
        if (user.data) {
            setName({
                firstName: user.data.firstName ?? "",
                lastName: user.data.lastName ?? "",
            });
        }
    }, [user.data]);

    useEffect(() => {
        if (workspace.data) setCurrency(toCurrencyCode(workspace.data.currency));
    }, [workspace.data]);

    const saveName = api.users.updateName.useMutation({
        onSuccess: async () => {
            setNameSaved(true);
            await utils.users.get.invalidate();
            // The sidebar renders the name from the session on the server.
            router.refresh();
        },
    });

    const saveCurrency = api.workspace.updateCurrency.useMutation({
        onSuccess: async (data) => {
            setCurrencySaved(true);
            await utils.workspace.get.invalidate();
            setCurrency(toCurrencyCode(data.currency));
        },
    });

    // tRPC types the Zod error loosely; same shape the clients page reads.
    type FieldErrors = Record<string, string[] | undefined>;
    const nameErrors =
        (saveName.error as { data?: { zodError?: { fieldErrors?: FieldErrors } } } | null)
            ?.data?.zodError?.fieldErrors ?? {};

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="text-overline uppercase text-fg-tertiary">Workspace</p>
                <h1 className="mt-2 text-display-page">Profile</h1>
                <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                    Your name appears on the invoices you send. The currency is the
                    default for new invoices and expenses.
                </p>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setNameSaved(false);
                    saveName.mutate(name);
                }}
                className="flex max-w-md flex-col gap-5 rounded-xl border border-border-default bg-surface p-6 shadow-card-elevated"
            >
                <h2 className="text-title-card">Your name</h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className="block">
                        <span className={labelClass}>First name</span>
                        <input
                            value={name.firstName}
                            onChange={(event) => {
                                setNameSaved(false);
                                setName({ ...name, firstName: event.target.value });
                            }}
                            aria-invalid={!!nameErrors?.firstName || undefined}
                            className={fieldClass(!!nameErrors?.firstName)}
                        />
                        {nameErrors?.firstName?.[0] && (
                            <span className={`block ${errorClass}`}>{nameErrors.firstName[0]}</span>
                        )}
                    </label>

                    <label className="block">
                        <span className={labelClass}>Last name</span>
                        <input
                            value={name.lastName}
                            onChange={(event) => {
                                setNameSaved(false);
                                setName({ ...name, lastName: event.target.value });
                            }}
                            aria-invalid={!!nameErrors?.lastName || undefined}
                            className={fieldClass(!!nameErrors?.lastName)}
                        />
                        {nameErrors?.lastName?.[0] && (
                            <span className={`block ${errorClass}`}>{nameErrors.lastName[0]}</span>
                        )}
                    </label>
                </div>

                {user.data?.email && (
                    <p className="text-body-s text-fg-tertiary">
                        You sign in with {user.data.email}.
                    </p>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saveName.isPending}
                        className={`${primaryButton} h-10 justify-center disabled:opacity-60`}
                    >
                        {saveName.isPending ? "Saving…" : "Save name"}
                    </button>
                    {nameSaved && !saveName.isPending && (
                        <span className="text-body-s flex items-center gap-1.5 text-fg-secondary">
                            <Check className="size-4" /> Saved
                        </span>
                    )}
                </div>

                {saveName.error && !nameErrors && (
                    <p role="alert" className="text-body-s text-status-overdue-fg">
                        {saveName.error.message}
                    </p>
                )}
            </form>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setCurrencySaved(false);
                    saveCurrency.mutate({ currency });
                }}
                className="flex max-w-md flex-col gap-5 rounded-xl border border-border-default bg-surface p-6 shadow-card-elevated"
            >
                <h2 className="text-title-card">Workspace currency</h2>

                <label className="block">
                    <span className={labelClass}>Currency</span>
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-fg-accent">
                            <CurrencyIcon code={currency} className="size-4" />
                        </span>
                        <select
                            value={currency}
                            onChange={(event) => {
                                setCurrencySaved(false);
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
                        disabled={saveCurrency.isPending}
                        className={`${primaryButton} h-10 justify-center disabled:opacity-60`}
                    >
                        {saveCurrency.isPending ? "Saving…" : "Save currency"}
                    </button>
                    {currencySaved && !saveCurrency.isPending && (
                        <span className="text-body-s flex items-center gap-1.5 text-fg-secondary">
                            <Check className="size-4" /> Saved
                        </span>
                    )}
                </div>

                {saveCurrency.error && (
                    <p role="alert" className="text-body-s text-status-overdue-fg">
                        {saveCurrency.error.message}
                    </p>
                )}
            </form>
        </div>
    );
}