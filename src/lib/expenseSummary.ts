import { Building2, House, Monitor, Printer, TrainFront, type LucideIcon } from "lucide-react";
import { sameMonth } from "./invoiceStatus";
import type { Expense, ExpenseCategory } from "./sampleExpenses";

export const categoryOrder: ExpenseCategory[] = ["RENT", "SUPPLIES", "TRAVEL", "SOFTWARE", "WORKSPACE"];

export const categoryLabels: Record<ExpenseCategory, string> = {
    RENT: "Rent",
    SUPPLIES: "Supplies",
    TRAVEL: "Travel",
    SOFTWARE: "Software",
    WORKSPACE: "Workspace",
};

export const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
    RENT: House,
    SUPPLIES: Printer,
    TRAVEL: TrainFront,
    SOFTWARE: Monitor,
    WORKSPACE: Building2,
};

// Fixed chart series per category (design system order), so a category keeps its color everywhere
export const categoryColors: Record<ExpenseCategory, string> = {
    RENT: "bg-chart-1",
    SUPPLIES: "bg-chart-2",
    TRAVEL: "bg-chart-3",
    SOFTWARE: "bg-chart-4",
    WORKSPACE: "bg-chart-5",
};

export const sumAmounts = (expenses: Pick<Expense, "amount">[]) =>
    expenses.reduce((total, e) => total + e.amount, 0);

export type CategoryTotal = { category: ExpenseCategory; total: number; share: number };

// Biggest category first; categories with no spend are left out
export function categoryBreakdown(expenses: Expense[]): CategoryTotal[] {
    const grandTotal = sumAmounts(expenses);
    return categoryOrder
        .map((category) => ({ category, total: sumAmounts(expenses.filter((e) => e.category === category)) }))
        .filter((t) => t.total > 0)
        .map((t) => ({ ...t, share: grandTotal > 0 ? t.total / grandTotal : 0 }))
        .sort((a, b) => b.total - a.total);
}

// ---------- Periods: one month ("2026-10") or year to date ("ytd") ----------

export type Period = string;

export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function monthFromKey(key: string) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year ?? 0, (month ?? 1) - 1, 1);
}

export function inPeriod(date: Date, period: Period, today: Date) {
    if (period === "ytd") return date.getFullYear() === today.getFullYear() && date <= today;
    return sameMonth(date, monthFromKey(period));
}

export function periodLabel(period: Period, today: Date) {
    if (period === "ytd") return `Year to date ${today.getFullYear()}`;
    return monthFromKey(period).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Every month that has an expense, newest first, always including the current month
export function periodOptions(expenses: Expense[], today: Date): Period[] {
    const months = new Set([monthKey(today), ...expenses.map((e) => monthKey(e.date))]);
    return [...[...months].sort().reverse(), "ytd"];
}