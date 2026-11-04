import { SignInForm } from "~/components/signInForm";
import { safeCallbackUrl } from "~/lib/authValidation";

export const metadata = {
    title: "Sign in · SimpleBooks",
};

type SignInPageProps = {
    searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
    const { callbackUrl } = await searchParams;

    return (
        <>
            <p className="text-overline uppercase text-fg-tertiary">Welcome back</p>
            <h1 className="mt-2 text-display-page">Sign in to your books</h1>
            <p className="mt-2 text-body-m text-fg-secondary">
                Your clients, invoices and totals are exactly where you left them.
            </p>
            <SignInForm callbackUrl={safeCallbackUrl(callbackUrl)} />
        </>
    );
}