import { Bell } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";

export function Header() {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <header className="flex h-20 items-center justify-between border-b border-border bg-surface px-12">
            <Breadcrumb />
            <div className="flex items-center gap-6 text-sm">
                <span className="text-text-muted">{today}</span>
                <span className="h-5 border-l border-border" />
                <span className="font-medium">USD</span>
                <Bell className="size-5 text-text-muted" />
            </div>
        </header>
    );
}