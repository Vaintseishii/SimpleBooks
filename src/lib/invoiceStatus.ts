import type { DisplayStatus } from "~/components/statusPill";
import type { Invoice } from "./sampleInvoices";

// OVERDUE isn't stored in the database: a SENT invoice becomes overdue
// once its due date has passed and it still isn't paid.
export function getDisplayStatus(invoice: Pick<Invoice, "status" | "dueDate">, today: Date): DisplayStatus {
    if (invoice.status === "PAID") return "paid";
    if (invoice.status === "DRAFT") return "draft";
    return invoice.dueDate < today ? "overdue" : "sent";
}

export const sameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" });
