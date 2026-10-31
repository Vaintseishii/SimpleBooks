import { InvoiceForm } from "~/components/invoiceForm";
import { sampleClients, samplePaymentMethods, sampleWorkspace } from "~/lib/sampleBilling";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";

export const metadata = { title: "New invoice · SimpleBooks" };

export default function NewInvoicePage() {
    // Sample data for now. Later: clients from api.client.list, numbers from the invoice router
    return (
        <InvoiceForm
            clients={sampleClients}
            paymentMethods={samplePaymentMethods}
            workspace={sampleWorkspace}
            existingNumbers={sampleInvoices.map((inv) => inv.number)}
            today={sampleToday}
        />
    );
}