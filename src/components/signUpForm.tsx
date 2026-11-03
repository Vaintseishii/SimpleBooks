"use client";

import { useEffect, useActionState, useState } from "react";
import NextLink from "next/link";
import { Check } from "lucide-react";
import { signUpAction, type AuthFormState } from "~/app/auth/actions";
import { PASSWORD_MAX_LENGTH, passwordRequirements } from "~/lib/authValidation";
import { primaryButton } from "./buttonStyles";
import { errorClass, fieldClass, labelClass } from "./fieldStyles";
import { PasswordInput } from "./passwordInput";

export function SignUpForm() {
    const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});
    const errors = state.fieldErrors ?? {};
    const [password, setPassword] = useState("");
    const requirements = passwordRequirements(password);

    // React clears uncontrolled fields after a form action; clear the checklist
    // with them so it can't stay green next to an empty password box.
    useEffect(() => {
        setPassword("");
    }, [state]);

    return (
        <form
            action={formAction}
            className="mt-8 flex flex-col gap-5"
            noValidate
            onInput={(event) => {
                const target = event.target;
                if (target instanceof HTMLInputElement && target.name === "password") {
                    setPassword(target.value);
                }
            }}
        >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className={labelClass}>
                        First name
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        required
                        defaultValue={state.values?.firstName}
                        placeholder="Juan"
                        aria-invalid={!!errors.firstName || undefined}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        className={fieldClass(!!errors.firstName)}
                    />
                    {errors.firstName && (
                        <p id="firstName-error" className={errorClass}>
                            {errors.firstName}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="lastName" className={labelClass}>
                        Last name
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        required
                        defaultValue={state.values?.lastName}
                        placeholder="Dela Cruz"
                        aria-invalid={!!errors.lastName || undefined}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        className={fieldClass(!!errors.lastName)}
                    />
                    {errors.lastName && (
                        <p id="lastName-error" className={errorClass}>
                            {errors.lastName}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="email" className={labelClass}>
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={state.values?.email}
                    placeholder="you@business.com"
                    aria-invalid={!!errors.email || undefined}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={fieldClass(!!errors.email)}
                />
                {errors.email && (
                    <p id="email-error" className={errorClass}>
                        {errors.email}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="password" className={labelClass}>
                    Password
                </label>
                <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    maxLength={PASSWORD_MAX_LENGTH}
                    invalid={!!errors.password}
                    describedBy="password-hint"
                />
                <p
                    id="password-hint"
                    className={errors.password ? errorClass : "mt-2 text-caption text-fg-tertiary"}
                >
                    {errors.password ?? "At least 8 characters, one letter and one number."}
                </p>
                <ul aria-live="polite" className="mt-2 flex flex-col gap-1">
                    {requirements.map((requirement) => (
                        <li
                            key={requirement.id}
                            className={`text-caption flex items-center gap-2 ${requirement.met ? "text-fg-secondary" : "text-fg-tertiary"}`}
                        >
                            <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                                {requirement.met ? (
                                    <Check className="size-3.5" />
                                ) : (
                                    <span className="size-1.5 rounded-full border border-current" />
                                )}
                            </span>
                            {requirement.label}
                            <span className="sr-only">{requirement.met ? " (met)" : " (not met)"}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm password
                </label>
                <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    maxLength={PASSWORD_MAX_LENGTH}
                    invalid={!!errors.confirmPassword}
                    describedBy={errors.confirmPassword ? "confirm-password-hint" : undefined}
                />
                {errors.confirmPassword && (
                    <p id="confirm-password-hint" className={errorClass}>
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={pending}
                className={`${primaryButton} h-11 w-full justify-center disabled:opacity-60`}
            >
                {pending ? "Creating your account…" : "Create account"}
            </button>

            <p className="mt-3 text-body-s text-fg-tertiary">
                Already have an account?{" "}
                <NextLink href="/auth/signin" className="font-medium text-fg-accent hover:underline">
                    Sign in
                </NextLink>
            </p>
        </form>
    );
}
