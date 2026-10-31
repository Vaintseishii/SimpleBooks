import "~/styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "~/components/sidebar";
import { Header } from "~/components/header";
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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
        <body className="flex min-h-screen font-sans">
            <TRPCReactProvider>
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-8">
                        <div className="mx-auto w-full max-w-content">{children}</div>
                    </main>
                </div>
            </TRPCReactProvider>
        </body>
        </html>
    );
}