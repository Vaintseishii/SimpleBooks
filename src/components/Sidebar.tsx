import { LayoutGrid, FileText, Wallet, Users } from "lucide-react";
import { NavLink } from "./navLinks";

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5">
      {/* logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="size-9 rounded-lg bg-brand" />
        <span className="text-xl">SimpleBooks</span>
      </div>

      <p className="mb-2 text-xs uppercase text-text-muted">Workspace</p>
      <nav className="flex flex-col gap-1">
        <NavLink href="/" icon={<LayoutGrid className="size-5" />}>Overview</NavLink>
    <NavLink href="/invoices" icon={<FileText className="size-5" />}>Invoices</NavLink>
    <NavLink href="/expenses" icon={<Wallet className="size-5" />}>Expenses</NavLink>
    <NavLink href="/who-owes-you" icon={<Users className="size-5" />}>Who owes you</NavLink>
      </nav>

      {/* user */}
      <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-sm font-medium text-brand">
          MC
        </div>
        <div className="flex flex-col">
          <span className="text-sm">Maya Chen</span>
          <span className="text-xs text-text-muted">Free plan</span>
        </div>
      </div>
    </aside>
  );
}