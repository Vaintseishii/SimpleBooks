import NextLink from "next/link";
import { Plus } from "lucide-react";
import { auth } from "~/auth";
import { OverviewStats } from "~/components/overviewStats";
import { primaryButton, secondaryButton } from "~/components/buttonStyles";

export default async function Overview() {
    const session = await auth();
    const name = session?.user?.name ?? session?.user?.email ?? "";
    const firstName = name.split(" ")[0];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-display-hero">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
                    <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
                        Here is how your business is doing.
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

            <OverviewStats />
        </div>
    );
}