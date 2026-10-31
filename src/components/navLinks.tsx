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
            aria-current={isActive ? "page" : undefined}
            className={`flex h-10 items-center gap-3 rounded-md px-3 text-body-m transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:outline-border-focus ${
                isActive
                    ? "bg-accent-soft font-medium text-fg-accent"
                    : "text-fg-secondary hover:bg-accent-soft/60 hover:text-fg-primary"
            }`}
        >
            {icon}
            {children}
        </NextLink>
    );
}