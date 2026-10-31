import "~/styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "~/auth";
import { AppShell } from "~/components/appShell";
import { Header } from "~/components/header";
import { Sidebar } from "~/components/sidebar";
import { TRPCReactProvider } from "~/trpc/react";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata = {
    title: "SimpleBooks",
    description: "Simple bookkeeping for small businesses",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Middleware already sent signed-out people to /auth/signin,
    // so outside /auth there is always a session here.
    const session = await auth();
    const user = {
        name: session?.user?.name ?? session?.user?.email ?? "",
        detail: session?.user?.email ?? "",
        image: session?.user?.image,
    };

    return (
        <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
            <body className="min-h-screen font-sans">
                <TRPCReactProvider>
                    <AppShell sidebar={<Sidebar user={user} />} header={<Header />}>
                        {children}
                    </AppShell>
                </TRPCReactProvider>
            </body>
        </html>
    );
}