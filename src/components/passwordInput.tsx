"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fieldClass } from "./fieldStyles";

type PasswordInputProps = {
    id: string;
    name: string;
    autoComplete: "current-password" | "new-password";
    invalid?: boolean;
    describedBy?: string;
};

// Password field with the eye button that shows / hides what you typed
export function PasswordInput({ id, name, autoComplete, invalid = false, describedBy }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                required
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className={`${fieldClass(invalid)} pr-11`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-120 ease-out hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}