import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { startOfMonth, startOfYear, endOfMonth, endOfYear } from "date-fns";

type Period = "thisMonth" | "yearToDate";

function getDateRange(period: Period, now: Date = new Date()) {
  switch (period) {
    case "thisMonth":
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case "yearToDate":
      return {
        from: startOfYear(now),
        to: endOfYear(now),
      };
  }
}

export const reportRouter = createTRPCRouter({
  profitAndLoss: protectedProcedure
    .input(z.object({
      period: z.enum(["thisMonth", "yearToDate"]).default("thisMonth"),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input.period);

      // Fetch revenue (paid invoices)
      const paidInvoices = await db.invoice.findMany({
        where: {
          userId: ctx.userId,
          status: "PAID",
          paidAt: { gte: from, lte: to },
        },
        select: { total: true, paidAt: true },
      });

      const revenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

      // Fetch expenses
      const expenses = await db.expense.findMany({
        where: {
          userId: ctx.userId,
          date: { gte: from, lte: to },
        },
        select: { amount: true, category: true, status: true, date: true },
      });

      // Only count PAID expenses for P&L
      const paidExpenses = expenses.filter((e) => e.status === "PAID");
      const totalExpenses = paidExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      // Group expenses by category
      const expensesByCategory = paidExpenses.reduce<Record<string, number>>((acc, exp) => {
        acc[exp.category] = (acc[exp.category] ?? 0) + Number(exp.amount);
        return acc;
      }, {});

      // Net profit
      const netProfit = revenue - totalExpenses;

      // Profit margin
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        period: input.period,
        dateRange: { from, to },
        revenue,
        totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory,
        invoiceCount: paidInvoices.length,
        expenseCount: paidExpenses.length,
      };
    }),

  // Category breakdown for charts
  categoryBreakdown: protectedProcedure
    .input(z.object({
      period: z.enum(["thisMonth", "yearToDate"]).default("thisMonth"),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input.period);

      const expenses = await db.expense.findMany({
        where: {
          userId: ctx.userId,
          date: { gte: from, lte: to },
          status: "PAID",
        },
        select: { amount: true, category: true },
      });

      const byCategory = expenses.reduce<Record<string, { total: number; count: number }>>((acc, exp) => {
        const cat = exp.category;
        acc[cat] ??= { total: 0, count: 0 };
        acc[cat].total += Number(exp.amount);
        acc[cat].count += 1;
        return acc;
      }, {});

      return byCategory;
    }),

  // Cash flow: money in vs money out over time
  cashFlow: protectedProcedure
    .input(z.object({
      period: z.enum(["thisMonth", "yearToDate"]).default("thisMonth"),
      interval: z.enum(["day", "week", "month"]).default("day"),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input.period);

      const [invoices, expenses] = await Promise.all([
        db.invoice.findMany({
          where: {
            userId: ctx.userId,
            status: "PAID",
            paidAt: { gte: from, lte: to },
          },
          select: { total: true, paidAt: true },
        }),
        db.expense.findMany({
          where: {
            userId: ctx.userId,
            status: "PAID",
            date: { gte: from, lte: to },
          },
          select: { amount: true, date: true },
        }),
      ]);

      // Group by interval
      function getKey(date: Date, interval: string): string {
        if (interval === "day") {
          const parts = date.toISOString().split("T");
          return parts[0] ?? date.toISOString();
        }
        if (interval === "week") {
          return `${date.getFullYear()}-W${String(Math.ceil(date.getDate() / 7)).padStart(2, "0")}`;
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      const inflow = invoices.reduce<Record<string, number>>((acc, inv) => {
        const date = new Date(inv.paidAt!);
        const key = getKey(date, input.interval);
        acc[key] = (acc[key] ?? 0) + Number(inv.total);
        return acc;
      }, {});

      const outflow = expenses.reduce<Record<string, number>>((acc, exp) => {
        const date = new Date(exp.date);
        const key = getKey(date, input.interval);
        acc[key] = (acc[key] ?? 0) + Number(exp.amount);
        return acc;
      }, {});

      // Combine all dates
      const allKeys = new Set([...Object.keys(inflow), ...Object.keys(outflow)]);

      return Array.from(allKeys).sort().map((key) => ({
        period: key,
        inflow: inflow[key] ?? 0,
        outflow: outflow[key] ?? 0,
        net: (inflow[key] ?? 0) - (outflow[key] ?? 0),
      }));
    }),
});