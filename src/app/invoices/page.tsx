"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Info, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { StatCard } from "~/components/statCard";
import { InvoicesTable } from "~/components/invoicesTable";
import { ExportButton } from "~/components/exportButton";
import { primaryButton } from "~/components/buttonStyles";
import { getDisplayStatus, sameMonth } from "~/lib/invoiceStatus";

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function InvoicesPageContent() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "SENT" | "PAID">("ALL");
    const [dateFilter, setDateFilter] = useState<"all" | "thisMonth" | "lastMonth">("all");

    const today = new Date();
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const list = api.invoices.list.useQuery({
        search: search === "" ? undefined : search,
        take: 100,
        skip: 0,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        dateFrom: dateFilter === "thisMonth" ? firstDayThisMonth : dateFilter === "lastMonth" ? firstDayLastMonth : undefined,
        dateTo: dateFilter === "lastMonth" ? lastDayLastMonth : undefined,
    });

    const invoices = list.data?.invoices ?? [];
    const sent = invoices.filter((inv) => inv.status === "SENT");
    const overdue = sent.filter((inv) => getDisplayStatus(inv, today) === "overdue");
    const paidThisMonth = invoices.filter((inv) => inv.paidAt && sameMonth(new Date(inv.paidAt), today));
    const drafts = invoices.filter((inv) => inv.status === "DRAFT");
    const monthName = today.toLocaleDateString("en-US", { month: "long" });

    if (list.isPending) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <p className="text-overline uppercase text-fg-tertiary">Billing, without the busywork</p>
                        <h1 className="mt-2 text-display-page">Invoices</h1>
                        <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                            From first draft to paid. Every invoice, in one place.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                        <ExportButton />
                        <NextLink href="/invoices/new" className={primaryButton}>
                            <Plus className="size-4" /> New invoice
                        </NextLink>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-6">
                    <StatCard label="Outstanding" value={0} note="Loading..." highlight />
                    <StatCard label="Overdue" value={0} note="Loading..." />
                    <StatCard label="Paid this month" value={0} note="Loading..." />
                    <StatCard label="Drafts" value={0} note="Loading..." />
                </div>
                <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-card">
                    <div className="p-6 text-center text-body-m text-fg-secondary">Loading invoices...</div>
                </div>
            </div>
        );
    }

    if (list.error) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <p className="text-overline uppercase text-fg-tertiary">Billing, without the busywork</p>
                        <h1 className="mt-2 text-display-page">Invoices</h1>
                        <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                            From first draft to paid. Every invoice, in one place.
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border border-border-default bg-surface shadow-card p-6">
                    <p className="text-body-m text-status-overdue-fg">Error loading invoices: {list.error.message}</p>
                    <button
                        onClick={() => list.refetch()}
                        className="mt-4 rounded-md px-4 py-2 text-label-m text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-overline uppercase text-fg-tertiary">Billing, without the busywork</p>
                    <h1 className="mt-2 text-display-page">Invoices</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        From first draft to paid. Every invoice, in one place.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <ExportButton />
                    <NextLink href="/invoices/new" className={primaryButton}>
                        <Plus className="size-4" /> New invoice
                    </NextLink>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <StatCard
                    label="Outstanding"
                    value={sum(sent.map((inv) => inv.total))}
                    note={`${plural(sent.length, "sent invoice")} awaiting payment`}
                    highlight
                />
                <StatCard
                    label="Overdue"
                    value={sum(overdue.map((inv) => inv.total))}
                    note={`${plural(overdue.length, "invoice")} ${overdue.length === 1 ? "needs" : "need"} a follow-up`}
                    overdue={overdue.length > 0}
                />
                <StatCard
                    label="Paid this month"
                    value={sum(paidThisMonth.map((inv) => inv.total))}
                    note={`${plural(paidThisMonth.length, "payment")} received in ${monthName}`}
                />
                <StatCard
                    label="Drafts"
                    value={sum(drafts.map((inv) => inv.total))}
                    note={`${plural(drafts.length, "invoice")} ready when you are`}
                />
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <div className="relative">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search invoice #, client, project..."
                        className="h-10 w-full max-w-sm rounded-md border border-border-default bg-sunken pr-3 pl-9 text-body-m text-fg-primary placeholder:text-fg-tertiary focus:border-border-accent focus:outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "ALL" | "DRAFT" | "SENT" | "PAID")}
                    className="h-10 appearance-none rounded-md border border-border-default bg-surface pr-3 pl-9 text-label-m text-fg-primary transition-colors duration-120 ease-out hover:bg-sunken focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    <option value="ALL">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                </select>
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as "all" | "thisMonth" | "lastMonth")}
                    className="h-10 appearance-none rounded-md border border-border-default bg-surface pr-3 pl-9 text-label-m text-fg-primary transition-colors duration-120 ease-out hover:bg-sunken focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    <option value="all">All dates</option>
                    <option value="thisMonth">Issued this month</option>
                    <option value="lastMonth">Issued last month</option>
                </select>
            </div>

            <InvoicesTable invoices={invoices} today={today} />

            <p className="flex items-center gap-2 text-body-s text-fg-tertiary">
                <Info className="size-4" />
                Outstanding includes sent and overdue invoices. Drafts aren't included until you send them.
            </p>
        </div>
    );
}

export default function InvoicesPage() {
    return <InvoicesPageContent />;
}