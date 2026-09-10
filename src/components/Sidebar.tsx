
"use client";
import { NavLink } from "./navLinks";


export function Sidebar() {
  return (
    <div className="h-80 w-64 p-4 flex flex-col gap-2 ">
        <h1 className="text-center font-bold text-4xl">SimpleBooks</h1>
      <NavLink href="/">Overview</NavLink>
      <NavLink href="/clients">Clients</NavLink>
      <NavLink href="/vendors">Vendors</NavLink>
    </div>
  );
}