import { z } from "zod";

import { createCrudRouter, type CrudDelegate } from "~/server/api/crud";
import { db } from "~/server/db";
import type { Vendor } from "../../../../generated/prisma";

const vendorFields = {
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
};

export const vendorRouter = createCrudRouter({
  delegate: db.vendor as CrudDelegate<Vendor>,
  fields: vendorFields,
  searchFields: ["name"],
});