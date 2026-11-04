import { ExpensesView } from "~/components/expensesView";

export const metadata = { title: "Expenses · SimpleBooks" };

export default function ExpensesPage() {
    // Expenses and vendors load from the database inside ExpensesView.
    return <ExpensesView />;
}