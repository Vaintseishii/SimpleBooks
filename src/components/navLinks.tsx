"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`text-2xl w-50 text-center py-2 ${isActive ? "bg-gray-200 rounded-full" : "text-black hover:bg-gray-200 hover:rounded-full"}`}>
      {children}
    </Link>
  );
}