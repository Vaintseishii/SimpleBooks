const base =
    "w-full rounded-md border bg-surface text-fg-primary placeholder:text-fg-tertiary transition-colors duration-120 ease-out focus:border-border-accent focus:outline-none";

// Pass true when the field has an error, so the border turns rust
export const fieldClass = (invalid = false) =>
    `${base} h-11 px-4 text-body-l ${invalid ? "border-status-overdue-fg" : "border-border-default hover:border-border-strong"}`;

export const smallFieldClass = (invalid = false) =>
    `${base} h-9 px-3 text-body-s ${invalid ? "border-status-overdue-fg" : "border-border-subtle hover:border-border-default"}`;

export const labelClass = "mb-2 block text-label-m text-fg-primary";

export const errorClass = "mt-2 text-caption text-status-overdue-fg";

export const cardClass = "rounded-lg border border-border-default bg-surface p-6 shadow-card";