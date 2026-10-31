import { ExpensesView } from "~/components/expensesView";
import { sampleExpenses, samplePaymentAccounts, sampleVendors } from "~/lib/sampleExpenses";
import { sampleToday } from "~/lib/sampleInvoices";

export const metadata = { title: "Expenses · SimpleBooks" };

export default function ExpensesPage() {
    // Sample data for now. Later: api.expense.list and api.vendor.list from Joseph's routers
    return (
        <ExpensesView
            initialExpenses={sampleExpenses}
            initialVendors={sampleVendors}
            paymentAccounts={samplePaymentAccounts}
            today={sampleToday}
        />
    );
}