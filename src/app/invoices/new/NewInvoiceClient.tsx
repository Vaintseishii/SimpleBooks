"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceForm } from "~/components/invoiceForm";
import type { RouterOutputs } from "~/trpc/react";

type ClientOption = RouterOutputs["clients"]["list"][number];
type WorkspaceInfo = { name: string; tagline: string | null; address: string | null; email: string | null; currency: string };

export function NewInvoiceClient() {
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
        onSuccess: () => {
            router.push("/invoices");
            router.refresh();
        },
    });

    const clients: ClientOption[] = clientsData ?? [];
    const existingNumbers = invoicesData?.invoices.map((inv) => inv.number) ?? [];
    const today = new Date();

    const workspace: WorkspaceInfo = {
        name: "SimpleBooks",
        tagline: "Billing, without the busywork",
        address: "123 Design Street\nSan Francisco, CA 94102",
        email: "hello@simplebooks.app",
        currency: "USD",
    };

    return (
        <InvoiceForm
            clients={clients}
            workspace={workspace}
            existingNumbers={existingNumbers}
            today={today}
            onSave={createInvoice.mutateAsync}
            isSaving={createInvoice.isPending}
        />
    );
}