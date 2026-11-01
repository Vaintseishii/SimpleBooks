"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceForm } from "~/components/invoiceForm";
import type { RouterOutputs } from "~/trpc/react";

type ClientOption = RouterOutputs["clients"]["list"][number] & { id: string; name: string };

export const metadata = { title: "New invoice · SimpleBooks" };

export default function NewInvoicePage() {
    const router = useRouter();

    const { data: clientsData } = api.clients.list.useQuery({
        search: undefined,
        take: 100,
        skip: 0,
    });

    const { data: invoicesData } = api.invoices.list.useQuery({
        search: undefined,
        take: 100,
        skip: 0,
        status: "ALL",
    });

    const createInvoice = api.invoices.create.useMutation({
        onSuccess: async () => {
            await router.push("/invoices");
            router.refresh();
        },
    });

    const clients: ClientOption[] = clientsData?.map((c) => ({ id: c.id, name: c.name })) ?? [];
    const existingNumbers = invoicesData?.invoices.map((inv) => inv.number) ?? [];
    const today = new Date();

    const workspace = {
        name: "SimpleBooks",
        address: "123 Design Street\nSan Francisco, CA 94102",
        email: "hello@simplebooks.app",
        currency: "USD",
    };

    const paymentMethods = [
        { id: "bank-transfer", label: "Bank Transfer" },
        { id: "stripe", label: "Stripe" },
        { id: "paypal", label: "PayPal" },
        { id: "check", label: "Check" },
        { id: "cash", label: "Cash" },
        { id: "other", label: "Other" },
    ];

    return (
        <InvoiceForm
            clients={clients}
            paymentMethods={paymentMethods}
            workspace={workspace}
            existingNumbers={existingNumbers}
            today={today}
            onSave={createInvoice.mutateAsync}
            isSaving={createInvoice.isPending}
        />
    );
}