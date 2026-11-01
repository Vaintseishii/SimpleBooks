"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceDetail } from "~/components/invoiceDetail";

export const metadata = { title: "Invoice · SimpleBooks" };

interface InvoicePageProps {
    params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
    const { id } = await params;
    return <InvoiceDetailPage invoiceId={id} />;
}

function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
    const router = useRouter();
    const { data: invoice, isPending, error } = api.invoices.byId.useQuery(
        { id: invoiceId },
        { enabled: !!invoiceId }
    );

    if (isPending) {
        return (
            <div className="flex flex-col gap-8 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-display-page">Loading...</h1>
                </div>
                <div className="rounded-lg border border-border-default bg-surface shadow-card p-8 text-center">
                    <p className="text-body-m text-fg-secondary">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        notFound();
    }

    return <InvoiceDetail invoice={invoice} onClose={() => router.push("/invoices")} />;
}