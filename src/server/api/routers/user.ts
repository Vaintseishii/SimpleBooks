import { TRPCError } from "@trpc/server";

import { unstable_update } from "~/auth";
import { fullName, nameSchema } from "~/lib/authValidation";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
        const user = await db.user.findUnique({
            where: { id: ctx.userId },
            select: { firstName: true, lastName: true, email: true },
        });

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        return user;
    }),

    updateName: protectedProcedure
        .input(nameSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await db.user.update({
                where: { id: ctx.userId },
                data: { firstName: input.firstName, lastName: input.lastName },
                select: { firstName: true, lastName: true },
            });

            // The sidebar reads the name off the session, so refresh the token.
            await unstable_update({
                user: { name: fullName(user.firstName, user.lastName) },
            });

            return user;
        }),
});
