const base =
    "inline-flex h-11 items-center gap-2 rounded-md px-5 text-label-m font-medium transition duration-120 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

export const primaryButton = `${base} btn-gradient text-fg-on-gradient shadow-card-elevated hover:shadow-card-hover`;
export const secondaryButton = `${base} border border-border-default bg-surface text-fg-primary hover:bg-sunken hover:border-border-strong`;
export const dangerButton = `${base} border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20`;