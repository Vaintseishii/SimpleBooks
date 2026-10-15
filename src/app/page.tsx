import NextLink from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { StatCard } from "~/components/statCard";

export default function Overview() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="mt-2 text-4xl">Good morning, Nig...</h1>
                    <p className="mt-2 text-text-muted">{"Here is the current overview of your workspace"}</p>
                </div>
                <div className="flex gap-3">
                    <NextLink href="/expenses" className="flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm hover:bg-page">
                        <Plus className="size-4" /> Record expense
                    </NextLink>
                    <NextLink href="/invoices/new" className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm text-white hover:bg-brand/90">
                        <Plus className="size-4" /> New invoice
                    </NextLink>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">October 2026 <ChevronDown className="size-4" /></span>
                    <span className="text-text-muted">Month to date · Oct 1–14</span>
                </div>
                <span className="text-text-muted">All figures in USD</span>
            </div>

            <div className="grid grid-cols-4 gap-5">
                <StatCard label="Money in" value={6767} note="3 invoices paid this month" highlight />
                <StatCard label="Money out" value={2000} note="6 business expenses recorded" />
                <StatCard label="Net income" value={67} note="Money in, less business expenses" />
                <StatCard label="Outstanding" value={676767} note="$6,000.00 is overdue · 4 invoices" />
            </div>
        </div>
    );
}