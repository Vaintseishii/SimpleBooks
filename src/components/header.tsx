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
            <span className="text-body-s text-fg-tertiary">{today}</span>
        </header>
    );
}