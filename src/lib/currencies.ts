// The currencies a workspace can pick from. Kept deliberately short and
// explicit: every code here has a Lucide glyph (see components/currencyIcon.tsx)
// and is safe for Intl.NumberFormat.
export type CurrencyCode =
    | "USD"
    | "EUR"
    | "GBP"
    | "PHP"
    | "JPY"
    | "AUD"
    | "CAD"
    | "SGD"
    | "INR"
    | "CHF";

export type CurrencyOption = {
    code: CurrencyCode;
    label: string;
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES: readonly CurrencyOption[] = [
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "British Pound" },
    { code: "PHP", label: "Philippine Peso" },
    { code: "JPY", label: "Japanese Yen" },
    { code: "AUD", label: "Australian Dollar" },
    { code: "CAD", label: "Canadian Dollar" },
    { code: "SGD", label: "Singapore Dollar" },
    { code: "INR", label: "Indian Rupee" },
    { code: "CHF", label: "Swiss Franc" },
] as const;

const CODES = new Set<string>(CURRENCIES.map((currency) => currency.code));

export function isSupportedCurrency(value: string): value is CurrencyCode {
    return CODES.has(value);
}

// Anything unrecognised falls back to the workspace default instead of
// throwing, so old rows and hand-edited values stay readable.
export function toCurrencyCode(value: string | null | undefined): CurrencyCode {
    return value && isSupportedCurrency(value) ? value : DEFAULT_CURRENCY;
}
