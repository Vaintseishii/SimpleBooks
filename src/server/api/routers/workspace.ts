import { z } from "zod";

import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "~/lib/currencies";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const currencyCodes = CURRENCIES.map((currency) => currency.code) as [
    CurrencyCode,
    ...CurrencyCode[],
];

/**
 * The workspace row is created lazily: accounts made before the workspace was
 * modelled (or before this feature) have none, so `get` reports the default and
 * `updateCurrency` upserts.
 */
export const workspaceRouter = createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
        const workspace = await db.workspace.findUnique({
            where: { userId: ctx.userId },
            select: { name: true, address: true, email: true, currency: true },
        });

        return (
            workspace ?? {
                name: "SimpleBooks",
                address: null,
                email: null,
                currency: DEFAULT_CURRENCY,
            }
        );
    }),

    updateDetails: protectedProcedure
        .input(
            z.object({
                name: z.string().trim().min(1, "Business name is required").max(120),
                address: z.string().trim().max(500).nullable(),
                email: z.string().trim().toLowerCase().email("Enter a valid email").nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const workspace = await db.workspace.upsert({
                where: { userId: ctx.userId },
                create: {
                    userId: ctx.userId,
                    name: input.name,
                    address: input.address,
                    email: input.email,
                },
                update: {
                    name: input.name,
                    address: input.address,
                    email: input.email,
                },
                select: { name: true, address: true, email: true },
            });

            return workspace;
        }),

    updateCurrency: protectedProcedure
        .input(z.object({ currency: z.enum(currencyCodes) }))
        .mutation(async ({ ctx, input }) => {
            const workspace = await db.workspace.upsert({
                where: { userId: ctx.userId },
                create: {
                    userId: ctx.userId,
                    name: "SimpleBooks",
                    currency: input.currency,
                },
                update: { currency: input.currency },
                select: { currency: true },
            });

            return workspace;
        }),
});
