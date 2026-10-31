"use client";

import { Download } from "lucide-react";
import { secondaryButton } from "./buttonStyles";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";
import { getDisplayStatus } from "~/lib/invoiceStatus";

const isoDate = (date: Date) => date.toLocaleDateString("en-CA"); // YYYY-MM-DD
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export function ExportButton() {
    function handleExport() {
        const header = ["Invoice", "Client", "Project", "Issued", "Due date", "Status", "Amount"];
        const rows = sampleInvoices.map((inv) => [
            inv.number,
            inv.client.name,
            inv.projectTitle,
            isoDate(inv.issueDate),
            isoDate(inv.dueDate),
            getDisplayStatus(inv, sampleToday).toUpperCase(),
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
        <button type="button" onClick={handleExport} className={secondaryButton}>
            <Download className="size-4" /> Export
        </button>
    );
}
