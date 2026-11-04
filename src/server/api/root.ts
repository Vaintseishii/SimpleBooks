import { clientRouter } from "~/server/api/routers/client";
import { expenseRouter } from "~/server/api/routers/expense";
import { invoiceRouter } from "~/server/api/routers/invoice";
import { reportRouter } from "~/server/api/routers/report";
import { vendorRouter } from "~/server/api/routers/vendor";
import { workspaceRouter } from "~/server/api/routers/workspace";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  clients: clientRouter,
  expenses: expenseRouter,
  invoices: invoiceRouter,
  reports: reportRouter,
  vendors: vendorRouter,
  workspace: workspaceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.client.list({});
 *       ^? Client[]
 */
export const createCaller = createCallerFactory(appRouter);
