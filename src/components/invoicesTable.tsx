"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { ArrowDownWideNarrow, CalendarDays, ChevronDown, Ellipsis, Search } from "lucide-react";
import { StatusPill, type DisplayStatus } from "./statusPill";
import { usd } from "~/lib/format";
import { getDisplayStatus, sameMonth, shortDate } from "~/lib/invoiceStatus";
import type { Invoice } from "~/lib/sampleInvoices";

type Tab = "all" | "sent" | "overdue" | "paid" | "draft";
type DateFilter = "all" | "thisMonth" | "lastMonth";
type Sort = "newest" | "oldest" | "dueSoonest" | "amountHigh";

const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All invoices" },
    { id: "sent", label: "Sent" },
    { id: "overdue", label: "Overdue" },
    { id: "paid", label: "Paid" },
    { id: "draft", label: "Drafts" },
];

// "Sent" means waiting on the client, so it includes overdue ones too
function inTab(tab: Tab, status: DisplayStatus) {
    if (tab === "all") return true;
    if (tab === "sent") return status === "sent" || status === "overdue";
    return status === tab;
}

const selectClass =
    "h-9 appearance-none rounded-md border border-border-default bg-surface pr-3 pl-9 text-label-m text-fg-primary transition-colors duration-120 ease-out hover:bg-sunken focus-visible:outline-2 focus-visible:outline-border-focus";
const selectIcon = "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-secondary";

type InvoicesTableProps = { invoices: Invoice[]; today: Date };

export function InvoicesTable({ invoices, today }: InvoicesTableProps) {
    const [tab, setTab] = useState<Tab>("all");
    const [query, setQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [client, setClient] = useState("all");
    const [sort, setSort] = useState<Sort>("newest");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const rows = useMemo(
        () => invoices.map((inv) => ({ ...inv, displayStatus: getDisplayStatus(inv, today) })),
        [invoices, today],
    );
    const clients = useMemo(() => [...new Set(invoices.map((inv) => inv.client.name))].sort(), [invoices]);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const visible = rows
        .filter((inv) => inTab(tab, inv.displayStatus))
        .filter((inv) => {
            const q = query.trim().toLowerCase();
            return !q || inv.number.toLowerCase().includes(q) || inv.client.name.toLowerCase().includes(q);
        })
        .filter((inv) => client === "all" || inv.client.name === client)
        .filter((inv) => {
            if (dateFilter === "thisMonth") return sameMonth(inv.issueDate, today);
            if (dateFilter === "lastMonth") return sameMonth(inv.issueDate, lastMonth);
            return true;
        })
        .sort((a, b) => {
            if (sort === "oldest") return a.issueDate.getTime() - b.issueDate.getTime();
            if (sort === "dueSoonest") return a.dueDate.getTime() - b.dueDate.getTime();
            if (sort === "amountHigh") return b.total - a.total;
            return b.issueDate.getTime() - a.issueDate.getTime();
        });

    const allSelected = visible.length > 0 && visible.every((inv) => selected.has(inv.id));

    function toggleAll() {
        setSelected(allSelected ? new Set() : new Set(visible.map((inv) => inv.id)));
    }

    function toggleOne(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-card">
            {/* tabs */}
            <div role="tablist" className="flex gap-8 border-b border-border-subtle px-6">
                {tabs.map((t) => {
                    const active = tab === t.id;
                    const count = rows.filter((inv) => inTab(t.id, inv.displayStatus)).length;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(t.id)}
                            className={`-mb-px flex h-14 items-center gap-2 border-b-2 text-label-m transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:outline-border-focus ${
                                active
                                    ? "border-accent text-fg-accent"
                                    : "border-transparent text-fg-secondary hover:text-fg-primary"
                            }`}
                        >
                            {t.label}
                            <span className="rounded-xs bg-sunken px-1.5 font-mono text-num-s text-fg-tertiary">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* toolbar */}
            <div className="flex items-center justify-between gap-4 p-6">
                <label className="relative w-full max-w-sm">
                    <span className="sr-only">Search client or invoice number</span>
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-tertiary" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search client or invoice number"
                        className="h-10 w-full rounded-md border border-border-default bg-sunken pr-3 pl-9 text-body-m text-fg-primary placeholder:text-fg-tertiary focus:border-border-accent focus:outline-none"
                    />
                </label>

                <div className="flex shrink-0 gap-3">
                    <div className="relative">
                        <CalendarDays className={selectIcon} />
                        <select aria-label="Filter by issue date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)} className={selectClass}>
                            <option value="all">All dates</option>
                            <option value="thisMonth">Issued this month</option>
                            <option value="lastMonth">Issued last month</option>
                        </select>
                    </div>
                    <div className="relative">
                        <ChevronDown className={selectIcon} />
                        <select aria-label="Filter by client" value={client} onChange={(e) => setClient(e.target.value)} className={selectClass}>
                            <option value="all">All clients</option>
                            {clients.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <ArrowDownWideNarrow className={selectIcon} />
                        <select aria-label="Sort invoices" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectClass}>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="dueSoonest">Due soonest</option>
                            <option value="amountHigh">Highest amount</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* table */}
            <table className="w-full text-left">
                <thead className="bg-sunken text-label-s text-fg-tertiary">
                    <tr className="h-10">
                        <th className="w-12 pl-6">
                            <input type="checkbox" aria-label="Select all invoices" checked={allSelected} onChange={toggleAll} className="size-4 rounded-xs align-middle accent-accent" />
                        </th>
                        <th className="px-4 font-medium">Invoice</th>
                        <th className="font-medium">Client / project</th>
                        <th className="font-medium">Issued</th>
                        <th className="font-medium">Due date</th>
                        <th className="font-medium">Status</th>
                        <th className="text-right font-medium">Amount</th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody className="text-body-m">
                    {visible.map((inv) => {
                        const isSelected = selected.has(inv.id);
                        const isOverdue = inv.displayStatus === "overdue";
                        return (
                            <tr
                                key={inv.id}
                                className={`h-14 border-t border-border-subtle transition-colors duration-120 ease-out ${
                                    isSelected ? "bg-accent-soft" : "hover:bg-sunken/60"
                                }`}
                            >
                                <td className="pl-6">
                                    <input type="checkbox" aria-label={`Select ${inv.number}`} checked={isSelected} onChange={() => toggleOne(inv.id)} className="size-4 rounded-xs align-middle accent-accent" />
                                </td>
                                <td className="px-4">
                                    <NextLink href={`/invoices/${inv.id}`} className="rounded-xs text-label-m text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-border-focus">
                                        {inv.number}
                                    </NextLink>
                                </td>
                                <td className="py-2">
                                    <p className="text-fg-primary">{inv.client.name}</p>
                                    <p className="text-body-s text-fg-tertiary">{inv.projectTitle}</p>
                                </td>
                                <td className="text-fg-secondary">{shortDate.format(inv.issueDate)}</td>
                                <td className={isOverdue ? "text-status-overdue-fg" : "text-fg-secondary"}>{shortDate.format(inv.dueDate)}</td>
                                <td>
                                    <StatusPill status={inv.displayStatus} />
                                </td>
                                <td className="text-right font-mono text-num-m">{usd.format(inv.total)}</td>
                                <td className="text-center">
                                    <button
                                        type="button"
                                        aria-label={`More actions for ${inv.number}`}
                                        className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                                    >
                                        <Ellipsis className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {visible.length === 0 && (
                        <tr className="border-t border-border-subtle">
                            <td colSpan={8} className="px-6 py-12 text-center text-body-m text-fg-secondary">
                                No invoices match that. Try another search or filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4 text-body-s text-fg-secondary">
                <span>
                    {visible.length === rows.length
                        ? `Showing all ${rows.length} invoices`
                        : `Showing ${visible.length} of ${rows.length} invoices`}
                </span>
                {selected.size > 0 && <span className="text-fg-primary">{selected.size} selected</span>}
            </div>
        </div>
    );
}
