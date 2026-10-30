import "~/styles/globals.css";
import { Roboto } from "next/font/google";
import { Sidebar } from "~/components/sidebar";
import { Header } from "~/components/header";
import { TRPCReactProvider } from "~/trpc/react";

const roboto = Roboto({
  subsets: ["latin"],
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
        <html lang="en">
        <body className={`${roboto.className} flex min-h-screen`}>
            <TRPCReactProvider>
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 px-12 py-10">{children}</main>
                </div>
            </TRPCReactProvider>
        </body>
        </html>
    );
}
