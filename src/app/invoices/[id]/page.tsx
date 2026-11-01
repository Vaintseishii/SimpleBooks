import { InvoiceDetailClient } from "./InvoiceDetailClient";

export const metadata = { title: "Invoice · SimpleBooks" };

interface InvoicePageProps {
    params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
    return <InvoiceDetailClient params={params} />;
}