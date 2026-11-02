import { ExpensesView } from "~/components/expensesView";
import { samplePaymentAccounts } from "~/lib/sampleExpenses";

export const metadata = { title: "Expenses · SimpleBooks" };

export default function ExpensesPage() {
    // Expenses and vendors load from the database inside ExpensesView.
    // Payment accounts are still sample data (there's no router for them).
    return <ExpensesView paymentAccounts={samplePaymentAccounts} />;
}
