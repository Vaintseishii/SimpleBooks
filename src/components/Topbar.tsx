import { NavLink } from "./navLinks";

export function Topbar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background">
            <nav className="mx-auto flex h-11 max-w-[980px] items-center justify-center gap-10 px-4">
                <NavLink href="/">Overview</NavLink>
                <NavLink href="/clients">Clients</NavLink>
                <NavLink href="/vendors">Vendors</NavLink>
            </nav>
        </header>
    );
}
