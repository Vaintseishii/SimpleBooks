"use client";

import { useState } from "react";
import { NavLink } from "./navLinks";

export function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-lg transition hover:bg-gray-800"
                aria-label={open ? "Close menu" : "Open menu"}
            >
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}
            </button>

            <div
                onClick={() => setOpen(false)}
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <div
                className={`fixed left-0 top-0 z-40 h-full w-72 bg-primary border border-border shadow-xl transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <nav className="flex flex-col gap-2 px-4 pt-24">
                    <NavLink href="/">Overview</NavLink>
                    <NavLink href="/clients">Clients</NavLink>
                    <NavLink href="/vendors">Vendors</NavLink>
                </nav>
            </div>
        </>
    );
}
