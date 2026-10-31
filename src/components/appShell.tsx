"use client";

import { usePathname } from "next/navigation";

type AppShellProps = {
    sidebar: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
};

// Wraps every page in the sidebar + header, except the /auth pages,
// which are full screen.
export function AppShell({ sidebar, header, children }: AppShellProps) {
    const pathname = usePathname();

    if (pathname.startsWith("/auth")) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            {sidebar}
            <div className="flex min-w-0 flex-1 flex-col">
                {header}
                <main className="flex-1 p-8">
                    <div className="mx-auto w-full max-w-content">{children}</div>
                </main>
            </div>
        </div>
    );
}