"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
                isActive
                ? "bg-hover text-text"
                : "text-text/80 hover:text-text"
            }`}
        >
            {children}
        </Link>
    );
}
