import Image from "next/image";
import { LayoutGrid, FileText, Wallet, Users } from "lucide-react";
import { NavLink } from "./navLinks";
import { SignOutButton } from "./signOutButton";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";
import { getDisplayStatus } from "~/lib/invoiceStatus";

interface SidebarProps {
    user: { name: string; detail: string; image?: string | null };
}

// "Maya Chen" -> "MC", "maya@alder.studio" -> "M"
function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}

export function Sidebar({ user }: SidebarProps) {
    // Sample data for now. Later: an overdue count from Joseph's invoice router
    const overdueCount = sampleInvoices.filter((inv) => getDisplayStatus(inv, sampleToday) === "overdue").length;

    return (
        <aside className="flex sticky top-0 h-dvh w-58 shrink-0 flex-col border-r border-border-subtle bg-canvas px-4 py-6">
            {/* logo */}
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="size-8 rounded-md bg-accent" />
                <span className="text-title-section">SimpleBooks</span>
            </div>

            <p className="mb-2 px-3 text-overline uppercase text-fg-tertiary">Workspace</p>
            <nav className="flex flex-col gap-0.5">

                <NavLink href="/" icon={<LayoutGrid className="size-4" />}>
                    Overview
                </NavLink>

                <NavLink href="/invoices" icon={<FileText className="size-4" />}>
                    Invoices
                </NavLink>

                <NavLink href="/expenses" icon={<Wallet className="size-4" />}>
                    Expenses
                </NavLink>

                <NavLink href="/who-owes-you" icon={<Users className="size-4" />} badge={overdueCount} badgeLabel="overdue">
                    Who owes you
                </NavLink>
            </nav>

            {/* user */}
            <div className="mt-auto flex items-center gap-3 border-t border-border-subtle pl-2 pt-4">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt=""
                        width={36}
                        height={36}
                        unoptimized
                        className="size-9 shrink-0 rounded-full"
                    />
                ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-label-s text-fg-accent">
                        {getInitials(user.name)}
                    </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label-m">{user.name}</span>
                    <span className="truncate text-caption text-fg-tertiary">{user.detail}</span>
                </div>
                <SignOutButton />
            </div>
        </aside>
    );
}