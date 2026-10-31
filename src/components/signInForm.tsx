"use client";

import { useActionState } from "react";
import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { signInAction, type AuthFormState } from "~/app/auth/actions";
import { primaryButton } from "./buttonStyles";
import { fieldClass, labelClass } from "./fieldStyles";
import { PasswordInput } from "./passwordInput";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
    const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signInAction, {});

    return (
        <form action={formAction} className="mt-8 flex flex-col gap-5" noValidate>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            {state.error && (
                <p
                    role="alert"
                    className="rounded-md border border-status-overdue-fg/30 bg-status-overdue px-4 py-3 text-body-s text-status-overdue-fg"
                >
                    {state.error}
                </p>
            )}

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
                    className={fieldClass()}
                />
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="text-label-m text-fg-primary">Password</label>
                    <NextLink href="/auth/forgot-password" className="text-label-s text-fg-accent hover:underline">
                        Forgot password?
                    </NextLink>
                </div>
                <PasswordInput id="password" name="password" autoComplete="current-password" />
            </div>

            <label className="flex items-center gap-2 text-body-s text-fg-secondary">
                <input type="checkbox" name="remember" defaultChecked className="size-4 rounded-xs accent-accent" />
                Keep me signed in
            </label>

            <button type="submit" disabled={pending} className={`${primaryButton} h-11 w-full justify-center disabled:opacity-60`}>
                {pending ? "Signing in…" : "Sign in"}
                {!pending && <ArrowUpRight className="size-4" aria-hidden />}
            </button>

            <p className="mt-3 text-body-s text-fg-tertiary">
                New to SimpleBooks?{" "}
                <NextLink href="/auth/signup" className="font-medium text-fg-accent hover:underline">
                    Create an account
                </NextLink>
            </p>
        </form>
    );
}