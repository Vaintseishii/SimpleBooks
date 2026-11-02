import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const expenseInput = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  merchant: z.string().trim().max(200).optional().or(z.literal("")).nullable(),
  description: z.string().trim().min(1, "Description is required").max(500),
  status: z.enum(["PAID", "UNPAID", "PENDING", "OVERDUE", "CANCELLED"]).optional(),
  category: z.enum(["TRAVEL", "WORKSPACE", "SUPPLIES", "SOFTWARE", "RENT"]).optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).optional(),
  date: z.date(),
  receiptUrl: z.string().url().optional().or(z.literal("")).nullable(),
  paidWith: z.string().trim().max(100).optional().or(z.literal("")).nullable(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")).nullable(),
});

const expenseUpdateInput = expenseInput.partial().extend({
  id: z.string().min(1),
});

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      search: z.string().trim().min(1).optional(),
      take: z.number().int().min(1).max(100).default(50),
      skip: z.number().int().min(0).default(0),
      status: z.enum(["PAID", "UNPAID", "PENDING", "OVERDUE", "CANCELLED", "ALL"]).default("ALL").optional(),
      category: z.enum(["TRAVEL", "WORKSPACE", "SUPPLIES", "SOFTWARE", "RENT", "ALL"]).default("ALL").optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { userId: ctx.userId };

      if (input.search) {
        where.OR = [
          { description: { contains: input.search, mode: "insensitive" } },
          { merchant: { contains: input.search, mode: "insensitive" } },
          { vendor: { name: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      if (input.status && input.status !== "ALL") {
        where.status = input.status;
      }

      if (input.category && input.category !== "ALL") {
        where.category = input.category;
      }

      if (input.dateFrom || input.dateTo) {
        where.date = {};
        const dateFilter = where.date as Record<string, Date>;
        if (input.dateFrom) dateFilter.gte = input.dateFrom;
        if (input.dateTo) dateFilter.lte = input.dateTo;
      }

      const [expenses, total] = await Promise.all([
        db.expense.findMany({
          where,
          orderBy: { date: "desc" },
          take: input.take,
          skip: input.skip,
          include: {
            vendor: { select: { name: true } },
          },
        }),
        db.expense.count({ where }),
      ]);

      const transformed = expenses.map((exp) => ({
        ...exp,
        vendor: exp.vendor ? { name: exp.vendor.name } : null,
        amount: Number(exp.amount),
      }));

      return { expenses: transformed, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const expense = await db.expense.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { vendor: true },
      });

      if (!expense) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return expense;
    }),

  create: protectedProcedure
    .input(expenseInput)
    .mutation(async ({ ctx, input }) => {
      const expense = await db.expense.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
        include: { vendor: true },
      });

      return expense;
    }),

  update: protectedProcedure
    .input(expenseUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...expenseData } = input;

      const existing = await db.expense.findFirst({
        where: { id, userId: ctx.userId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const expense = await db.expense.update({
        where: { id },
        data: expenseData,
        include: { vendor: true },
      });

      return expense;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await db.expense.deleteMany({
        where: { id: input.id, userId: ctx.userId },
      });

      if (count === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { id: input.id };
    }),
});