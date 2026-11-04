import {
    Coins,
    DollarSign,
    Euro,
    IndianRupee,
    JapaneseYen,
    PhilippinePeso,
    PoundSterling,
    SwissFranc,
    type LucideIcon,
} from "lucide-react";

import type { CurrencyCode } from "~/lib/currencies";

// Lucide has no distinct glyph for the dollar-derived currencies (AUD, CAD,
// SGD), so they share the plain dollar sign with USD.
const ICONS: Record<CurrencyCode, LucideIcon> = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    PHP: PhilippinePeso,
    JPY: JapaneseYen,
    AUD: DollarSign,
    CAD: DollarSign,
    SGD: DollarSign,
    INR: IndianRupee,
    CHF: SwissFranc,
};

export function CurrencyIcon({
    code,
    className,
}: {
    code: CurrencyCode;
    className?: string;
}) {
    const Icon = ICONS[code] ?? Coins;
    return <Icon className={className} aria-hidden />;
}
