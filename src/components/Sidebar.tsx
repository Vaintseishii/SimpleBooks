"use client";
import { NavLink } from "./navLinks";


export function Sidebar() {
  return (
    <div className="w-180 p-4 mt-6 gap-9 flex justify-center rounded-full bg-white shadow-lg">
      <NavLink href="/">Overview</NavLink>
      <NavLink href="/clients">Clients</NavLink>
      <NavLink href="/vendors">Vendors</NavLink>
    </div>
  );
}