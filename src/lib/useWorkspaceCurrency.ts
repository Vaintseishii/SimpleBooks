"use client";

import { toCurrencyCode, type CurrencyCode } from "~/lib/currencies";
import { api } from "~/trpc/react";

/**
 * The workspace's default currency, for screens that total across records
 * (stat cards, balances, breakdowns). Individual records format with the
 * currency stored on the record, not this.
 */
export function useWorkspaceCurrency(): CurrencyCode {
    const workspace = api.workspace.get.useQuery();
    return toCurrencyCode(workspace.data?.currency);
}
