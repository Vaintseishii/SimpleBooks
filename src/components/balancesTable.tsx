"use client";

import { useState } from "react";
import NextLink from "next/link";
import { ArrowUpRight, ArrowDownWideNarrow, ChevronDown, Mail } from "lucide-react";
import { usd } from "~/lib/format";
import { dueLabel, sortBalances, sumBalances, type Balance, type SortOrder } from "~/lib/receivables";

type Tab = "all" | "overdue";

const rowDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(0, 2)
        .map((word) => word[0]!.toUpperCase())
        .join("");

const actionClass =
    "inline-flex items-center gap-2 rounded-sm align-middle text-label-m text-fg-accent transition-colors duration-120 ease-out hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

type BalancesTableProps = {
    balances: Balance[];
    selectedId: string | null;
    onRemind: (invoiceId: string) => void;
};

export function BalancesTable({ balances, selectedId, onRemind }: BalancesTableProps) {
    const [tab, setTab] = useState<Tab>("all");
    const [order, setOrder] = useState<SortOrder>("oldest");

    const overdueCount = balances.filter((b) => b.overdue).length;
    const visible = sortBalances(tab === "overdue" ? balances.filter((b) => b.overdue) : balances, order);

    const tabs: { value: Tab; label: string; count: number }[] = [
        { value: "all", label: "All balances", count: balances.length },
        { value: "overdue", label: "Overdue", count: overdueCount },
    ];

    return (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-card">
            {/* tabs + sort */}
            <div className="flex items-center justify-between gap-4 px-6">
                <div role="tablist" aria-label="Balances" className="flex gap-6">
                    {tabs.map((t) => {
                        const active = tab === t.value;
                        return (
                            <button
                                key={t.value}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(t.value)}
                                className={`-mb-px border-b-2 py-5 text-label-m transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:outline-border-focus ${
                                    active ? "border-accent text-fg-accent" : "border-transparent text-fg-secondary hover:text-fg-primary"
                                }`}
                            >
                                {t.label} · {t.count}
                            </button>
                        );
                    })}
                </div>

                <div className="relative">
                    <ArrowDownWideNarrow className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-secondary" />
                    <select
                        aria-label="Sort balances"
                        value={order}
                        onChange={(e) => setOrder(e.target.value as SortOrder)}
                        className="h-9 appearance-none rounded-md border border-border-default bg-surface pr-8 pl-9 text-label-m text-fg-primary transition-colors duration-120 ease-out hover:bg-sunken focus-visible:outline-2 focus-visible:outline-border-focus"
                    >
                        <option value="oldest">Oldest first</option>
                        <option value="largest">Largest first</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-tertiary" />
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-sunken">
                    <tr className="h-10 text-overline uppercase text-fg-tertiary">
                        <th scope="col" className="pl-6 font-semibold">Client</th>
                        <th scope="col" className="font-semibold">Invoice</th>
                        <th scope="col" className="font-semibold">Due date</th>
                        <th scope="col" className="text-right font-semibold">Balance</th>
                        <th scope="col" className="pr-6 text-right font-semibold">Next step</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.map((b) => {
                        const selected = b.invoice.id === selectedId;
                        return (
                            <tr
                                key={b.invoice.id}
                                aria-selected={selected}
                                className={`h-16 border-t border-border-subtle ${selected ? "bg-accent-soft" : ""}`}
                            >
                                <td className={`pl-6 ${selected ? "shadow-[inset_3px_0_0_var(--color-accent)]" : ""}`}>
                                    <div className="flex items-center gap-3 py-3">
                                        <span
                                            aria-hidden
                                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sunken text-label-s text-fg-secondary"
                                        >
                                            {initials(b.invoice.client.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-body-m text-fg-primary">{b.invoice.client.name}</p>
                                            <p className={`text-caption ${b.overdue ? "text-status-overdue-fg" : "text-fg-tertiary"}`}>
                                                {dueLabel(b)}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="font-mono text-num-m text-fg-secondary">{b.invoice.number}</td>
                                <td className="text-body-m text-fg-secondary">{rowDate.format(b.invoice.dueDate)}</td>
                                <td className="text-right font-mono text-num-m text-fg-primary">{usd.format(b.amount)}</td>
                                <td className="pr-6 text-right">
                                    {b.overdue ? (
                                        <button
                                            type="button"
                                            onClick={() => onRemind(b.invoice.id)}
                                            aria-label={`Remind ${b.invoice.client.name} about ${b.invoice.number}`}
                                            className={actionClass}
                                        >
                                            <Mail className="size-4" /> Remind
                                        </button>
                                    ) : (
                                        // No invoice detail page yet, so this opens the Invoices list
                                        <NextLink href="/invoices" className={actionClass}>
                                            <ArrowUpRight className="size-4" /> View invoice
                                        </NextLink>
                                    )}
                                </td>
                            </tr>
                        );
                    })}

                    {visible.length === 0 && (
                        <tr className="border-t border-border-subtle">
                            <td colSpan={5} className="px-6 py-12 text-center text-body-m text-fg-secondary">
                                {tab === "overdue" ? "Nothing overdue. Everyone’s on time." : "Nobody owes you anything right now. Nice."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-5">
                <p className="text-body-s text-fg-tertiary">Draft invoices are not included</p>
                <p className="text-label-m text-fg-primary">
                    Total <span className="ml-2 font-mono text-num-m">{usd.format(sumBalances(visible))}</span>
                </p>
            </div>
        </div>
    );
}