import { z } from "zod";

import { createCrudRouter, type CrudDelegate } from "~/server/api/crud";
import { db } from "~/server/db";
import type { Vendor } from "../../../../generated/prisma";

const fields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
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

export const vendorRouter = createCrudRouter({
  delegate: db.vendor as CrudDelegate<Vendor>,
  fields,
  searchFields: ["name", "email"],
});
