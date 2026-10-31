import NextLink from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { StatCard } from "~/components/statCard";
import { CashFlowChart } from "~/components/cashFlowChart";
import { FollowUpCard } from "~/components/followUpCard";
import { InvoiceActivity } from "~/components/invoiceActivity";
import { primaryButton, secondaryButton } from "~/components/buttonStyles";

export default function Overview() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-display-hero">Good morning, All Might</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        {"Hewe is the cuwwent ovewview of youw finyances, uwu~"}
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <NextLink href="/expenses" className={secondaryButton}>
                        <Plus className="size-4" /> Record expense
                    </NextLink>
                    <NextLink href="/invoices/new" className={primaryButton}>
                        <Plus className="size-4" /> New invoice
                    </NextLink>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button type="button" className="flex items-center gap-1 rounded-sm text-label-m focus-visible:outline-2 focus-visible:outline-border-focus">
                        October 2026 <ChevronDown className="size-4" />
                    </button>
                    <span className="text-body-s text-fg-tertiary">Month to date · Oct 1–14</span>
                </div>
                <span className="text-body-s text-fg-tertiary">All figures in USD</span>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <StatCard label="Money in" value={9800} note="3 invoices paid this month" highlight />
                <StatCard label="Money out" value={1284} note="6 business expenses recorded" />
                <StatCard label="Net income" value={8516} note="Money in, less business expenses" />
                <StatCard label="Outstanding" value={10650} note="$6,000.00 is overdue · 4 invoices" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <CashFlowChart />
                </div>
                <FollowUpCard />
            </div>

            <InvoiceActivity />
        </div>
    );
}