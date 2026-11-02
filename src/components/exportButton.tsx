"use client";

import { Download } from "lucide-react";
import { secondaryButton } from "./buttonStyles";
import { api } from "~/trpc/react";
import { getDisplayStatus } from "~/lib/invoiceStatus";

const isoDate = (date: Date) => date.toLocaleDateString("en-CA"); // YYYY-MM-DD
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export function ExportButton() {
    const utils = api.useUtils();

    async function handleExport() {
        // Fetch on click (from cache if it's fresh), so the page doesn't load invoices twice
        const { invoices } = await utils.invoices.list.fetch({ take: 100 });
        const today = new Date();
        const header = ["Invoice", "Client", "Project", "Issued", "Due date", "Status", "Amount"];
        const rows = invoices.map((inv) => [
            inv.number,
            inv.client.name,
            inv.projectTitle ?? "",
            isoDate(inv.issueDate),
            isoDate(inv.dueDate),
            getDisplayStatus(inv, today).toUpperCase(),
            inv.total.toFixed(2),
        ]);
        const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices-${isoDate(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <button type="button" onClick={() => void handleExport()} className={secondaryButton}>
            <Download className="size-4" /> Export
        </button>
    );
}