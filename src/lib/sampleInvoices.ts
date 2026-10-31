// Sample data until Joseph's invoice router lands.
// Shaped like the Prisma Invoice model so the swap is easy later.

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID";

export type Invoice = {
    id: string;
    number: string;
    client: { name: string };
    projectTitle: string;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    total: number;
    paidAt: Date | null;
};

// Pinned to the design's date so the sample numbers line up with the Overview.
// When real data arrives, use new Date() instead.
export const sampleToday = new Date(2026, 9, 14);

const day = (month: number, date: number) => new Date(2026, month - 1, date);

export const sampleInvoices: Invoice[] = [
    { id: "1052", number: "INV-1052", client: { name: "Juniper Coffee" }, projectTitle: "October design retainer", issueDate: day(10, 14), dueDate: day(10, 28), status: "DRAFT", total: 3000, paidAt: null },
    { id: "1051", number: "INV-1051", client: { name: "Bloom Wellness" }, projectTitle: "Brand guidelines", issueDate: day(10, 7), dueDate: day(10, 28), status: "SENT", total: 2850, paidAt: null },
    { id: "1050", number: "INV-1050", client: { name: "Forma Objects" }, projectTitle: "Packaging design", issueDate: day(10, 6), dueDate: day(10, 20), status: "SENT", total: 1800, paidAt: null },
    { id: "1049", number: "INV-1049", client: { name: "Northstar Co." }, projectTitle: "Website design", issueDate: day(9, 23), dueDate: day(10, 7), status: "SENT", total: 2400, paidAt: null },
    { id: "1048", number: "INV-1048", client: { name: "Juniper Coffee" }, projectTitle: "Brand identity", issueDate: day(9, 16), dueDate: day(9, 30), status: "SENT", total: 3600, paidAt: null },
    { id: "1047", number: "INV-1047", client: { name: "Willow Home" }, projectTitle: "E-commerce design", issueDate: day(9, 12), dueDate: day(10, 12), status: "PAID", total: 4200, paidAt: day(10, 12) },
    { id: "1046", number: "INV-1046", client: { name: "Arc Architecture" }, projectTitle: "Visual identity", issueDate: day(9, 8), dueDate: day(10, 8), status: "PAID", total: 3200, paidAt: day(10, 8) },
    { id: "1045", number: "INV-1045", client: { name: "Kin Collective" }, projectTitle: "Campaign direction", issueDate: day(9, 2), dueDate: day(10, 2), status: "PAID", total: 2400, paidAt: day(10, 2) },
];
