import { SignUpForm } from "~/components/signUpForm";

export const metadata = {
    title: "Create an account · SimpleBooks",
};

export default function SignUpPage() {
    return (
        <>
            <p className="text-overline uppercase text-fg-tertiary">Get started</p>
            <h1 className="mt-2 text-display-page">Create your account</h1>
            <p className="mt-2 text-body-m text-fg-secondary">
                Set up your books in a minute. Clients and invoices come next.
            </p>
            <SignUpForm />
        </>
    );
}