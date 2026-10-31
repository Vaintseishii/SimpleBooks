import { LayoutGrid, FileText, Wallet, Users } from "lucide-react";
import { NavLink } from "./navLinks";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";
import { getDisplayStatus } from "~/lib/invoiceStatus";

export function Sidebar() {
    // Sample data for now. Later: an overdue count from Joseph's invoice router
    const overdueCount = sampleInvoices.filter((inv) => getDisplayStatus(inv, sampleToday) === "overdue").length;

    return (
        <aside className="flex w-58 shrink-0 flex-col border-r border-border-subtle bg-canvas px-4 py-6">
            {/* logo */}
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="size-8 rounded-md bg-accent" />
                <span className="text-title-section">SimpleBooks</span>
            </div>

            <p className="mb-2 px-3 text-overline uppercase text-fg-tertiary">Workspace</p>
            <nav className="flex flex-col gap-0.5">
                <NavLink href="/" icon={<LayoutGrid className="size-4" />}>Overview</NavLink>
                <NavLink href="/invoices" icon={<FileText className="size-4" />}>Invoices</NavLink>
                <NavLink href="/expenses" icon={<Wallet className="size-4" />}>Expenses</NavLink>
                <NavLink href="/who-owes-you" icon={<Users className="size-4" />} badge={overdueCount} badgeLabel="overdue">
                    Who owes you
                </NavLink>
            </nav>

            {/* user */}
            <div className="mt-auto flex items-center gap-3 border-t border-border-subtle px-2 pt-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-label-s text-fg-accent">
                    AM
                </div>
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-label-m">All Might</span>
                    <span className="truncate text-caption text-fg-tertiary">Pro Max Plus Ultra Plan</span>
                </div>
            </div>
        </aside>
    );
}