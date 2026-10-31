"use client";

import { useActionState } from "react";
import NextLink from "next/link";
import { signUpAction, type AuthFormState } from "~/app/auth/actions";
import { primaryButton } from "./buttonStyles";
import { errorClass, fieldClass, labelClass } from "./fieldStyles";
import { PasswordInput } from "./passwordInput";

export function SignUpForm() {
    const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});
    const errors = state.fieldErrors ?? {};

    return (
        <form action={formAction} className="mt-8 flex flex-col gap-5" noValidate>
            <div>
                <label htmlFor="name" className={labelClass}>Your name</label>
                <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    defaultValue={state.values?.name}
                    aria-invalid={!!errors.name || undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={fieldClass(!!errors.name)}
                />
                {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="email" className={labelClass}>Email</label>
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
                {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    invalid={!!errors.password}
                    describedBy="password-hint"
                />
                <p id="password-hint" className={errors.password ? errorClass : "mt-2 text-caption text-fg-tertiary"}>
                    {errors.password ?? "At least 8 characters."}
                </p>
            </div>

            <button type="submit" disabled={pending} className={`${primaryButton} h-11 w-full justify-center disabled:opacity-60`}>
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