import { WhoOwesYouView } from "~/components/whoOwesYouView";

export const metadata = { title: "Who owes you · SimpleBooks" };

export default function WhoOwesYouPage() {
    // Invoices and unpaid bills load from the database inside WhoOwesYouView.
    return <WhoOwesYouView />;
}