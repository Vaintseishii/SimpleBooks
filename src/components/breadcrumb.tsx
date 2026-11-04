"use client";

import { Fragment } from "react";
import NextLink from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  "/": "Overview",
  "/invoices": "Invoices",
  "/invoices/new": "New invoice",
  "/expenses": "Expenses",
  "/clients": "Clients",
  "/who-owes-you": "Who owes you",
};

// "/invoices/new" -> ["/invoices", "/invoices/new"], so nested pages show their parent
function pathsFor(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return ["/"];
  return segments.map((_, i) => `/${segments.slice(0, i + 1).join("/")}`);
}

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = pathsFor(pathname).filter((path) => labels[path]);

  return (
    <div className="flex items-center gap-2">
      <NextLink
        href="/"
        className="text-body-m text-fg-tertiary hover:text-fg-primary focus-visible:outline-border-focus rounded-xs transition-colors duration-120 ease-out focus-visible:outline-2"
      >
        Workspace
      </NextLink>
      {crumbs.map((path, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <Fragment key={path}>
            <ChevronRight className="text-fg-tertiary size-4" />
            {isLast ? (
              <span className="text-label-m text-fg-primary">
                {labels[path]}
              </span>
            ) : (
              <NextLink
                href={path}
                className="text-body-m text-fg-secondary hover:text-fg-primary focus-visible:outline-border-focus rounded-xs transition-colors duration-120 ease-out focus-visible:outline-2"
              >
                {labels[path]}
              </NextLink>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
