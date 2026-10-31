"use client";

import { Fragment } from "react";
import NextLink from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
    "/": "Overview",
    "/invoices": "Invoices",
    "/invoices/new": "New invoice",
    "/expenses": "Expenses",
    "/who-owes-you": "Who owes you",
};

// "/invoices/new" -> ["/invoices", "/invoices/new"], so nested pages show their parent
function pathsFor(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["/"];
    return segments.map((_, i) => `/${segments.slice(0, i + 1).join("/")}`);
}

export function Breadcrumb() {
    const pathname = usePathname();
    const crumbs = pathsFor(pathname).filter((path) => labels[path]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-body-m text-fg-tertiary">Workspace</span>
            {crumbs.map((path, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <Fragment key={path}>
                        <ChevronRight className="size-4 text-fg-tertiary" />
                        {isLast ? (
                            <span className="text-label-m text-fg-primary">{labels[path]}</span>
                        ) : (
                            <NextLink
                                href={path}
                                className="rounded-xs text-body-m text-fg-secondary transition-colors duration-120 ease-out hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                            >
                                {labels[path]}
                            </NextLink>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}