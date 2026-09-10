"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`text-2xl w-full text-center py-2 ${isActive ? "bg-gray-200" : "text-black hover:bg-gray-200"}`}>
      {children}
    </Link>
  );
}