"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceForm } from "~/components/invoiceForm";
import { toCurrencyCode } from "~/lib/currencies";
import type { RouterOutputs } from "~/trpc/react";

type ClientOption = RouterOutputs["clients"]["list"][number];
type WorkspaceInfo = { name: string; address: string | null; email: string | null; currency: string };

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

    const workspaceQuery = api.workspace.get.useQuery();

    const createInvoice = api.invoices.create.useMutation({
        onSuccess: () => {
            router.push("/invoices");
            router.refresh();
        },
    });

    const utils = api.useUtils();
    const updateDetails = api.workspace.updateDetails.useMutation({
        onSuccess: async () => {
            await utils.workspace.get.invalidate();
        },
    });

    const clients: ClientOption[] = clientsData ?? [];
    const existingNumbers = invoicesData?.invoices.map((inv) => inv.number) ?? [];
    const today = new Date();

    // The form seeds its currency once, so wait for the stored default.
    if (workspaceQuery.isPending) {
        return (
            <p className="text-body-m text-fg-secondary">Loading invoice form…</p>
        );
    }

    const workspace: WorkspaceInfo = {
        name: workspaceQuery.data?.name ?? "SimpleBooks",
        address: workspaceQuery.data?.address ?? null,
        email: workspaceQuery.data?.email ?? null,
        currency: toCurrencyCode(workspaceQuery.data?.currency),
    };

    return (
        <InvoiceForm
            clients={clients}
            workspace={workspace}
            existingNumbers={existingNumbers}
            today={today}
            onSave={createInvoice.mutateAsync}
            isSaving={createInvoice.isPending}
            onBusinessChange={(details) => updateDetails.mutate(details)}
        />
    );
}