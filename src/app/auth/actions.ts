"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "~/auth";
import { safeCallbackUrl, signUpSchema } from "~/lib/authValidation";
import { db } from "~/server/db";

// What the forms get back when something is wrong.
// `values` refills the fields so people don't retype everything.
export type AuthFormState = {
    error?: string;
    fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
    values?: { name?: string; email?: string };
};

// formData.get() can also return a File, so only accept text
function text(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
}

export async function signInAction(
    _prev: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const email = text(formData, "email").trim().toLowerCase();
    const password = text(formData, "password");
    const remember = formData.get("remember") === "on";
    const redirectTo = safeCallbackUrl(text(formData, "callbackUrl"));

    if (!email || !password) {
        return { error: "Enter your email and password.", values: { email } };
    }

    try {
        // On success this throws a redirect, so nothing below runs
        await signIn("credentials", {
            email,
            password,
            remember: String(remember),
            redirectTo,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return {
                error:
                    error.type === "CredentialsSignin"
                        ? "That email and password don't match."
                        : "Something went wrong signing you in. Please try again.",
                values: { email },
            };
        }
        throw error; // the redirect
    }
    return {};
}

export async function signUpAction(
    _prev: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const raw = {
        name: text(formData, "name"),
        email: text(formData, "email"),
        password: text(formData, "password"),
    };
    const values = { name: raw.name, email: raw.email };

    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        return {
            values,
            fieldErrors: {
                name: errors.name?.[0],
                email: errors.email?.[0],
                password: errors.password?.[0],
            },
        };
    }
    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        return {
            values,
            fieldErrors: { email: "There's already an account with this email." },
        };
    }

    await db.user.create({
        data: { name, email, passwordHash: await hash(password, 12) },
    });

    // Sign the new user straight in (throws a redirect to the overview)
    await signIn("credentials", {
        email,
        password,
        remember: "true",
        redirectTo: "/",
    });
    return {};
}