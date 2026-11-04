"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceDetail } from "~/components/invoiceDetail";

interface InvoiceDetailClientProps {
    params: Promise<{ id: string }>;
}

export function InvoiceDetailClient({ params }: InvoiceDetailClientProps) {
    const router = useRouter();
    const [invoiceId, setInvoiceId] = useState<string>("");

    useEffect(() => {
        void params.then((p) => setInvoiceId(p.id));
    }, [params]);

    if (!invoiceId) {
        return (
            <div className="flex flex-col gap-8 p-6">
                <div className="rounded-lg border border-border-default bg-surface shadow-card p-8 text-center">
                    <p className="text-body-m text-fg-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    const { data: invoice, isPending, error } = api.invoices.byId.useQuery(
        { id: invoiceId },
        { enabled: !!invoiceId }
    );

    if (isPending) {
        return (
            <div className="flex flex-col gap-8 p-6">
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