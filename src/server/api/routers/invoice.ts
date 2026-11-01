import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import type { Invoice, InvoiceItem, Payment } from "../../../../generated/prisma";

const invoiceItemInput = z.object({
  description: z.string().trim().min(1, "Description is required").max(500),
  subDescription: z.string().trim().max(500).optional().or(z.literal("")),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
});

const invoiceCreateInput = z.object({
  clientId: z.string().min(1, "Client is required"),
  number: z.string().trim().min(1, "Invoice number is required").max(50),
  status: z.enum(["DRAFT", "SENT", "PAID"]).default("DRAFT"),
  projectTitle: z.string().trim().max(200).optional().or(z.literal("")),
  issueDate: z.date(),
  dueDate: z.date(),
  currency: z.string().length(3).default("USD"),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  paymentMethod: z.string().max(100).optional().or(z.literal("")).nullable(),
  notesToClient: z.string().trim().max(5000).optional().or(z.literal("")).nullable(),
  items: z.array(invoiceItemInput).min(1, "At least one line item is required"),
});

const invoiceUpdateInput = invoiceCreateInput.partial().extend({
  id: z.string().min(1),
});

const paymentInput = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
});

export const invoiceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      search: z.string().trim().min(1).optional(),
      take: z.number().int().min(1).max(100).default(50),
      skip: z.number().int().min(0).default(0),
      status: z.enum(["DRAFT", "SENT", "PAID", "ALL"]).default("ALL").optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { userId: ctx.userId };

      if (input.search) {
        where.OR = [
          { number: { contains: input.search, mode: "insensitive" } },
          { client: { name: { contains: input.search, mode: "insensitive" } } },
          { projectTitle: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.status && input.status !== "ALL") {
        where.status = input.status;
      }

      if (input.dateFrom || input.dateTo) {
        where.issueDate = {};
        if (input.dateFrom) where.issueDate.gte = input.dateFrom;
        if (input.dateTo) where.issueDate.lte = input.dateTo;
      }

      const [invoices, total] = await Promise.all([
        db.invoice.findMany({
          where,
          orderBy: { issueDate: "desc" },
          take: input.take,
          skip: input.skip,
          include: {
            client: { select: { name: true } },
            items: { select: { amount: true } },
          },
        }),
        db.invoice.count({ where }),
      ]);

      // Transform to match the expected Invoice type with client.name and computed total
      const transformed = invoices.map((inv) => ({
        ...inv,
        client: { name: inv.client.name },
        total: Number(inv.total),
        items: inv.items,
      }));

      return { invoices: transformed, total };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const invoice = await db.invoice.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: {
          client: true,
          items: true,
          payments: { orderBy: { date: "desc" } },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return invoice;
    }),

  create: protectedProcedure
    .input(invoiceCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { items, ...invoiceData } = input;

      // Check for duplicate number
      const existing = await db.invoice.findFirst({
        where: { userId: ctx.userId, number: invoiceData.number },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${invoiceData.number} is already used.`,
        });
      }

      const invoice = await db.invoice.create({
        data: {
          ...invoiceData,
          userId: ctx.userId,
          sentAt: invoiceData.status === "SENT" ? new Date() : null,
          items: {
            create: items.map((item) => ({
              ...item,
              amount: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          client: true,
          items: true,
        },
      });

      return invoice;
    }),

  update: protectedProcedure
    .input(invoiceUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...invoiceData } = input;

      const existing = await db.invoice.findFirst({
        where: { id, userId: ctx.userId },
        include: { items: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check for duplicate number (excluding current invoice)
      if (invoiceData.number && invoiceData.number !== existing.number) {
        const duplicate = await db.invoice.findFirst({
          where: { userId: ctx.userId, number: invoiceData.number, NOT: { id } },
        });

        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `${invoiceData.number} is already used.`,
          });
        }
      }

      // Handle items update: delete old items, create new ones
      const updateData: Record<string, unknown> = { ...invoiceData };

      if (items) {
        updateData.items = {
          deleteMany: { invoiceId: id },
          create: items.map((item) => ({
            ...item,
            amount: item.quantity * item.unitPrice,
          })),
        };
      }

      // Handle sentAt when status changes to SENT
      if (invoiceData.status === "SENT" && existing.status !== "SENT") {
        updateData.sentAt = new Date();
      }

      // Auto-update status to PAID if fully paid
      const totalPaid = existing.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
      const newTotal = invoiceData.total ?? Number(existing.total);
      if (totalPaid >= newTotal && existing.status !== "PAID") {
        updateData.status = "PAID";
        updateData.paidAt = new Date();
      }

      const invoice = await db.invoice.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          items: true,
        },
      });

      return invoice;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await db.invoice.deleteMany({
        where: { id: input.id, userId: ctx.userId },
      });

      if (count === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { id: input.id };
    }),

  createPayment: protectedProcedure
    .input(paymentInput)
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, amount, date } = input;

      const invoice = await db.invoice.findFirst({
        where: { id: invoiceId, userId: ctx.userId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const newTotalPaid = totalPaid + amount;

      if (newTotalPaid > Number(invoice.total) + 0.01) { // Allow small rounding difference
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payment amount exceeds balance due. Balance: ${Number(invoice.total) - totalPaid}`,
        });
      }

      const payment = await db.payment.create({
        data: {
          invoiceId,
          userId: ctx.userId,
          amount,
          date,
        },
      });

      // Update invoice status if fully paid
      if (newTotalPaid >= Number(invoice.total) - 0.01 && invoice.status !== "PAID") {
        await db.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });
      }

      return payment;
    }),

  // Get next invoice number
  nextNumber: protectedProcedure.query(async ({ ctx }) => {
    const lastInvoice = await db.invoice.findFirst({
      where: { userId: ctx.userId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const numbers = lastInvoice
      ? [Number(lastInvoice.number.replace(/\D/g, "")) || 0]
      : [0];

    return `INV-${Math.max(1000, ...numbers) + 1}`;
  }),
});