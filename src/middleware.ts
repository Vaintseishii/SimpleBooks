import NextAuth from "next-auth";
import { authConfig } from "~/authConfig";

// Runs before every page. The `authorized` callback in authConfig decides
// who gets in; signed-out people are sent to /auth/signin.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    // Every path except API routes (tRPC checks its own), Next.js files and the favicon
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};