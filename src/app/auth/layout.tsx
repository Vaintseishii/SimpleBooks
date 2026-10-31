import { BookOpen } from "lucide-react";

// Shared by sign in, sign up and forgot password: green brand panel on the
// left, the page on the right. The panel hides on small screens.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-canvas">
            <aside
                className="relative hidden w-[40%] max-w-xl shrink-0 flex-col justify-between overflow-hidden bg-accent-hover p-10 text-fg-on-accent lg:flex"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.08), transparent 55%)",
                }}
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="size-5" aria-hidden />
                    <span className="text-title-card">SimpleBooks</span>
                </div>

                <figure className="max-w-sm">
                    <div className="mb-6 h-px w-10 bg-fg-on-accent/40" />
                    <blockquote className="text-title-section text-fg-on-accent">
                        Month-end went from two evenings to twenty minutes.
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-fg-on-accent/15 text-label-s">
                            MC
                        </div>
                        <div className="flex flex-col">
                            <span className="text-label-m">Maya Chen</span>
                            <span className="text-caption text-fg-on-accent/70">Owner, Alder Studio</span>
                        </div>
                    </figcaption>
                </figure>

                <p className="text-caption text-fg-on-accent/60">
                    © {new Date().getFullYear()} SimpleBooks · Built for small businesses
                </p>
            </aside>

            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-sm">{children}</div>
            </main>
        </div>
    );
}