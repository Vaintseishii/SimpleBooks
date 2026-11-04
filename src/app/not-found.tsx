import NextLink from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-display-hero">404</p>
            <p className="text-body-l text-fg-secondary">Page not found</p>
            <NextLink href="/" className="rounded-md bg-accent px-6 py-3 text-label-m text-fg-on-accent hover:bg-accent-hover transition-colors">
                Go home
            </NextLink>
        </div>
    );
}