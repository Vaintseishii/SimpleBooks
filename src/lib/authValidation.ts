import { z } from "zod";

// bcrypt only looks at the first 72 bytes of a password, so cap it there
export const signUpSchema = z.object({
    name: z.string().trim().min(1, "Enter your name").max(80, "Keep it under 80 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Use at least 8 characters")
        .max(72, "Keep it under 72 characters"),
});

export const signInSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
    remember: z.enum(["true", "false"]).default("false"),
});

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