import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { secondaryButton } from "~/components/buttonStyles";

export const metadata = {
    title: "Forgot password · SimpleBooks",
};

// Placeholder: real reset links need an email service, which we don't have yet
export default function ForgotPasswordPage() {
    return (
        <>
            <p className="text-overline uppercase text-fg-tertiary">Forgot password</p>
            <h1 className="mt-2 text-display-page">Reset your password</h1>
            <p className="mt-2 text-body-m text-fg-secondary">
                Password reset by email isn&apos;t available yet. Ask your workspace
                admin to reset it for you, then sign in again.
            </p>
            <NextLink href="/auth/signin" className={`${secondaryButton} mt-8 h-11 w-full justify-center`}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to sign in
            </NextLink>
        </>
    );
}