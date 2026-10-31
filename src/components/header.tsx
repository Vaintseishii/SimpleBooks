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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-8">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <span className="text-body-s text-fg-tertiary">{today}</span>
                <span className="h-4 border-l border-border-default" />
                <span className="text-label-m">USD</span>
                <button
                    type="button"
                    aria-label="Notifications"
                    className="rounded-md p-2 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    <Bell className="size-4" />
                </button>
            </div>
        </header>
    );
}