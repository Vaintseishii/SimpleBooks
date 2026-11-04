"use client";

import { useMemo } from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { InvoiceForm } from "~/components/invoiceForm";
import { draftFromInvoice } from "~/lib/invoiceDraft";
import { toCurrencyCode } from "~/lib/currencies";
import { Skeleton, SkeletonCard } from "~/components/skeleton";
import type { RouterOutputs } from "~/trpc/react";

type ClientOption = RouterOutputs["clients"]["list"][number];
type WorkspaceInfo = { name: string; address: string | null; email: string | null; currency: string };

function EditInvoiceSkeleton() {
    return (
        <div className="flex flex-col gap-8" aria-busy="true">
            <span className="sr-only" role="status">Loading invoice…</span>
            <div className="flex flex-col gap-3" aria-hidden>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid grid-cols-12 items-start gap-6" aria-hidden>
                <div className="col-span-7 flex flex-col gap-6">
                    <SkeletonCard className="h-96" />
                    <SkeletonCard className="h-72" />
                </div>
                <div className="col-span-5">
                    <SkeletonCard className="h-[32rem]" />
                </div>
            </div>
        </div>
    );
}

function EditInvoiceError() {
    return (
        <div className="rounded-xl border border-border-default bg-surface p-8 text-center shadow-card">
            <p className="text-body-m text-fg-secondary">
                We couldn&apos;t load this invoice. It may have been deleted.
            </p>
            <NextLink
                href="/invoices"
                className="mt-4 inline-block rounded-xs text-label-m text-fg-accent hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                Back to invoices
            </NextLink>
        </div>
    );
}

export function EditInvoiceClient() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id;

    const { data: invoice, isPending: invoicePending, error: invoiceError } =
        api.invoices.byId.useQuery({ id });

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

    const utils = api.useUtils();

    const updateInvoice = api.invoices.update.useMutation({
        onSuccess: async () => {
            await utils.invoices.list.invalidate();
        },
    });

    const updateDetails = api.workspace.updateDetails.useMutation({
        onSuccess: async () => {
            await utils.workspace.get.invalidate();
        },
    });

    // Seed the form once from the saved invoice; a fresh object each render
    // would re-run the form's useState initialiser. The router returns Prisma
    // Decimal for quantity/unitPrice, so narrow those to plain numbers first.
    const initialDraft = useMemo(() => {
        if (!invoice) return undefined;
        return draftFromInvoice({
            clientId: invoice.clientId,
            number: invoice.number,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            items: invoice.items.map((item) => ({
                description: item.description,
                subDescription: item.subDescription,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
            })),
        });
    }, [invoice]);

    // The form seeds its currency picker once, so wait for the stored default.
    if (invoicePending || workspaceQuery.isPending) {
        return <EditInvoiceSkeleton />;
    }

    if (invoiceError || !invoice) {
        return <EditInvoiceError />;
    }

    const clients: ClientOption[] = clientsData ?? [];
    // Exclude the invoice being edited, or validation flags its own number.
    const existingNumbers =
        invoicesData?.invoices.filter((inv) => inv.id !== id).map((inv) => inv.number) ?? [];
    const today = new Date();

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
            initialDraft={initialDraft}
            mode="edit"
            onSave={async (input) => {
                await updateInvoice.mutateAsync({ id, ...input });
                router.push("/invoices");
            }}
            isSaving={updateInvoice.isPending}
            onBusinessChange={(details) => updateDetails.mutate(details)}
        />
    );
}
