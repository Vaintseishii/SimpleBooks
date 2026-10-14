"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = { href: string; icon: React.ReactNode; children: React.ReactNode };

export function NavLink({ href, icon, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <NextLink
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive
                    ? "bg-brand-soft font-medium text-brand"
                    : "text-text-muted hover:bg-brand-soft/60 hover:text-text"
            }`}
        >
            {icon}
            {children}
        </NextLink>
    );
}