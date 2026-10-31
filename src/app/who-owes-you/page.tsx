import { WhoOwesYouView } from "~/components/whoOwesYouView";
import { sampleInvoices, sampleToday } from "~/lib/sampleInvoices";
import { sampleExpenses } from "~/lib/sampleExpenses";
import { sampleClients, samplePaymentMethods } from "~/lib/sampleBilling";
import { sampleReminderHistory, sampleSender } from "~/lib/sampleReminders";

export const metadata = { title: "Who owes you · SimpleBooks" };

export default function WhoOwesYouPage() {
    // Sample data for now. Later: api.invoice.list, api.expense.list and api.client.list from Joseph's routers
    return (
        <WhoOwesYouView
            initialInvoices={sampleInvoices}
            expenses={sampleExpenses}
            clients={sampleClients}
            paymentMethods={samplePaymentMethods}
            reminderHistory={sampleReminderHistory}
            sender={sampleSender}
            today={sampleToday}
        />
    );
}