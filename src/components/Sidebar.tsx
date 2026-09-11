"use client";
import { NavLink } from "./navLinks";


export function Sidebar() {
  return (
    <div className="w-full p-4 pl-220 pr-220 flex justify-between">
      <NavLink href="/">Overview</NavLink>
      <NavLink href="/clients">Clients</NavLink>
      <NavLink href="/vendors">Vendors</NavLink>
    </div>
  );
}