import { z } from "zod";

// bcrypt only looks at the first 72 bytes of a password, so cap it there
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type PasswordRequirement = {
    id: "length" | "max" | "letter" | "number";
    label: string;
    met: boolean;
};

// Single source of truth for the live checklist in the sign-up form and for
// the server-side schema below.
export function passwordRequirements(password: string): PasswordRequirement[] {
    return [
        {
            id: "length",
            label: `At least ${PASSWORD_MIN_LENGTH} characters`,
            met: password.length >= PASSWORD_MIN_LENGTH,
        },
        {
            id: "max",
            label: `At most ${PASSWORD_MAX_LENGTH} characters`,
            met: password.length <= PASSWORD_MAX_LENGTH,
        },
        {
            id: "letter",
            label: "At least one letter",
            met: /\p{L}/u.test(password),
        },
        {
            id: "number",
            label: "At least one number",
            met: /\d/.test(password),
        },
    ];
}

// The user's display name. Shared by sign-up and the profile page.
export const nameSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "Enter your first name")
        .max(40, "Keep it under 40 characters"),
    lastName: z
        .string()
        .trim()
        .min(1, "Enter your last name")
        .max(40, "Keep it under 40 characters"),
});

export const signUpSchema = z
    .object({
        ...nameSchema.shape,
        email: z.string().trim().toLowerCase().email("Enter a valid email"),
        password: z
            .string()
            .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
            .max(PASSWORD_MAX_LENGTH, `Keep it under ${PASSWORD_MAX_LENGTH} characters`)
            .regex(/\p{L}/u, "Add at least one letter")
            .regex(/\d/, "Add at least one number"),
        confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords don't match",
    });

export const signInSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
    remember: z.enum(["true", "false"]).default("false"),
});

// Display name for the session. First and last name are stored separately; the
// rest of the app keeps reading a single `name` from the session.
export function fullName(
    firstName?: string | null,
    lastName?: string | null,
): string | null {
    const name = [firstName, lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ");
    return name.length > 0 ? name : null;
}

// Where to go after signing in. Middleware sends a full URL
// ("http://localhost:3000/invoices"), so keep only the path ("/invoices").
// That also means a link can never send someone to another website.
export function safeCallbackUrl(value: string | null | undefined) {
    if (!value) return "/";
    try {
        const url = new URL(value, "http://localhost");
        return url.pathname + url.search;
    } catch {
        return "/";
    }
}
