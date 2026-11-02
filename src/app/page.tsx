import NextLink from "next/link";
import { Plus } from "lucide-react";
import { auth } from "~/auth";
import { OverviewStats } from "~/components/overviewStats";
import { primaryButton, secondaryButton } from "~/components/buttonStyles";

export default async function Overview() {
    const session = await auth();
    const name = session?.user?.name ?? session?.user?.email ?? "";
    const firstName = name.split(" ")[0];

    const today = new Date();
    const month = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const shortMonth = today.toLocaleDateString("en-US", { month: "short" });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-display-hero">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        Here is how your business is doing this month.
                    </p>
                </div>
                <div className="flex shrink-0 gap-3">
                    <NextLink href="/expenses" className={secondaryButton}>
                        <Plus className="size-4" /> Record expense
                    </NextLink>
                    <NextLink href="/invoices/new" className={primaryButton}>
                        <Plus className="size-4" /> New invoice
                    </NextLink>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-label-m">{month}</span>
                    <span className="text-body-s text-fg-tertiary">
                        Month to date · {shortMonth} 1–{today.getDate()}
                    </span>
                </div>
                <span className="text-body-s text-fg-tertiary">All figures in USD</span>
            </div>

            <OverviewStats />
        </div>
    );
}