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
});
