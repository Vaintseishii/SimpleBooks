import { toCurrencyCode, type CurrencyCode } from "~/lib/currencies";

// Intl.NumberFormat construction is not free, and these run per rendered row.
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: CurrencyCode, whole: boolean) {
    const key = `${currency}:${whole ? "whole" : "cents"}`;
    let cached = formatters.get(key);
    if (!cached) {
        cached = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            ...(whole ? { maximumFractionDigits: 0 } : {}),
        });
        formatters.set(key, cached);
    }
    return cached;
}

/** Money in the currency the record itself was saved with. */
export function formatMoney(value: number, currency: string | null | undefined) {
    return formatter(toCurrencyCode(currency), false).format(value);
}

/** Same, rounded to whole units — for stat cards and chart labels. */
export function formatMoneyWhole(value: number, currency: string | null | undefined) {
    return formatter(toCurrencyCode(currency), true).format(value);
}
