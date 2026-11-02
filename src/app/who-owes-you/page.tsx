import { WhoOwesYouView } from "~/components/whoOwesYouView";
import { samplePaymentMethods } from "~/lib/sampleBilling";
import { sampleSender } from "~/lib/sampleReminders";

export const metadata = { title: "Who owes you · SimpleBooks" };

export default function WhoOwesYouPage() {
    // Invoices, clients and unpaid bills load from the database inside WhoOwesYouView.
    // Payment methods and the reminder sign-off are still sample data (no router for them yet).
    return <WhoOwesYouView paymentMethods={samplePaymentMethods} sender={sampleSender} />;
}