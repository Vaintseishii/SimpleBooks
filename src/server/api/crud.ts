import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/** The slice of a Prisma model delegate this router uses. */
export type CrudDelegate<TRow> = {
  findMany(args: Record<string, unknown>): Promise<TRow[]>;
  findFirst(args: Record<string, unknown>): Promise<TRow | null>;
  create(args: Record<string, unknown>): Promise<TRow>;
  update(args: Record<string, unknown>): Promise<TRow>;
  deleteMany(args: Record<string, unknown>): Promise<{ count: number }>;
};

export const crudListInput = z.object({
  search: z.string().trim().min(1).optional(),
  take: z.number().int().min(1).max(100).default(50),
  skip: z.number().int().min(0).default(0),
});

export const crudIdInput = z.object({
  id: z.string().min(1, "An id is required"),
});

function normalizeToNull(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ]),
  );
}

/**
 * Builds list/byId/create/update/delete for a user-owned model. Ownership always
 * comes from `ctx.userId`, never from the request body.
 */
export function createCrudRouter<
  TRow extends { id: string },
  TFields extends z.ZodRawShape,
>(config: {
  delegate: CrudDelegate<TRow>;
  fields: TFields;
  searchFields?: string[];
  orderBy?: Record<string, "asc" | "desc">;
}) {
  const createInput = z.object(config.fields);
  const updateInput = createInput
    .partial()
    .extend({ id: z.string().min(1, "An id is required") });

  const searchFields = config.searchFields ?? ["name"];
  const orderBy = config.orderBy ?? { createdAt: "desc" };

  return createTRPCRouter({
    list: protectedProcedure
      .input(crudListInput)
      .query(async ({ ctx, input }) => {
        const where: Record<string, unknown> = { userId: ctx.userId };

        if (input.search) {
          where.OR = searchFields.map((field) => ({
            [field]: { contains: input.search, mode: "insensitive" },
          }));
        }

        return config.delegate.findMany({
          where,
          orderBy,
          take: input.take,
          skip: input.skip,
        });
      }),

    byId: protectedProcedure
      .input(crudIdInput)
      .query(async ({ ctx, input }) => {
        const row = await config.delegate.findFirst({
          where: { id: input.id, userId: ctx.userId },
        });

        if (!row) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return row;
      }),

    create: protectedProcedure
      .input(createInput)
      .mutation(async ({ ctx, input }) => {
        return config.delegate.create({
          data: {
            // Spread drops a type-level `| undefined` from Zod's generic object type.
            ...normalizeToNull({ ...input }),
            userId: ctx.userId,
          },
        });
      }),

    update: protectedProcedure
      .input(updateInput)
      .mutation(async ({ ctx, input }) => {
        const { id, ...changes } = { ...input };

        const existing = await config.delegate.findFirst({
          where: { id, userId: ctx.userId },
        });

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return config.delegate.update({
          where: { id },
          data: normalizeToNull(changes),
        });
      }),

    delete: protectedProcedure
      .input(crudIdInput)
      .mutation(async ({ ctx, input }) => {
        // deleteMany can be scoped by userId in one statement; delete cannot.
        const { count } = await config.delegate.deleteMany({
          where: { id: input.id, userId: ctx.userId },
        });

        if (count === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return { id: input.id };
      }),
  });
}
