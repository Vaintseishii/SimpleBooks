import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createCrudRouter, type CrudDelegate } from "~/server/api/crud";
import { db } from "~/server/db";
import type { Client } from "../../../../generated/prisma";

const fields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  contactName: z
    .string()
    .trim()
    .max(120, "Contact name is too long")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(40, "Phone is too long")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
};

export const clientRouter = createCrudRouter({
  delegate: db.client as CrudDelegate<Client>,
  fields,
  searchFields: ["name", "email"],
  // Invoice.client is `onDelete: Restrict`, so a client that has invoices can't
  // be deleted. Refuse with a message that says what to do instead.
  async beforeDelete({ userId, id }) {
    const client = await db.client.findFirst({
      where: { id, userId },
      select: { name: true, _count: { select: { invoices: true } } },
    });

    // Missing rows fall through so delete reports NOT_FOUND.
    if (!client || client._count.invoices === 0) return;

    const count = client._count.invoices;
    throw new TRPCError({
      code: "CONFLICT",
      message: `${client.name} has ${count} invoice${count === 1 ? "" : "s"}. Delete ${
        count === 1 ? "it" : "them"
      } first, or keep the client for your records.`,
    });
  },
});
