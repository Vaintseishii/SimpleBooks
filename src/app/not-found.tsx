import NextLink from "next/link";
import { primaryButton } from "~/components/buttonStyles";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-display-hero">404</p>
            <p className="text-body-l text-fg-secondary">Page not found</p>
            <NextLink href="/" className={primaryButton}>
                Go home
            </NextLink>
        </div>
    );
}