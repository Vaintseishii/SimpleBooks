"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
    "/": "Overview",
    "/invoices": "Invoices",
    "/invoices/new": "New invoice",
    "/expenses": "Expenses",
    "/who-owes-you": "Who owes you",
};

export function Breadcrumb() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Workspace</span>
            <ChevronRight className="size-4 text-text-muted" />
            <span className="font-medium">{labels[pathname] ?? ""}</span>
        </div>
    );
}