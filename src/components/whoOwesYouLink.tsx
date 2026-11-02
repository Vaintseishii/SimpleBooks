"use client";

import { Users } from "lucide-react";
import { api } from "~/trpc/react";
import { getDisplayStatus } from "~/lib/invoiceStatus";
import { NavLink } from "./navLinks";

// Client component so the badge can use tRPC and refresh when a payment is recorded.
// Same query as the Who owes you page, so they share one cached request.
export function WhoOwesYouLink() {
    const { data } = api.invoices.list.useQuery({ status: "SENT", take: 100 }); // sent = not paid yet
    const today = new Date();
    const overdueCount = (data?.invoices ?? []).filter((inv) => getDisplayStatus(inv, today) === "overdue").length;

    return (
        <NavLink href="/who-owes-you" icon={<Users className="size-4" />} badge={overdueCount} badgeLabel="overdue">
            Who owes you
        </NavLink>
    );
}